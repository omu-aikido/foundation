<script setup lang="ts">
  type Status = "loading" | "checking" | "verified" | "expired" | "error";
  const props = defineProps<{ siteKey: string }>();
  const emit = defineEmits<{ token: [value: string]; status: [value: Status] }>();
  const container = ref<HTMLElement>();
  const status = ref<Status>("loading");
  let widgetId: string | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  useHead({
    script: [
      {
        src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
        defer: true,
      },
    ],
  });

  function setStatus(value: Status) {
    status.value = value;
    emit("status", value);
  }

  function render() {
    if (!props.siteKey || !container.value || !window.turnstile) {
      retryTimer = setTimeout(render, 100);
      return;
    }
    widgetId = window.turnstile.render(container.value, {
      sitekey: props.siteKey,
      action: "contact",
      callback(token: string) {
        emit("token", token);
        setStatus("verified");
      },
      "before-interactive-callback"() {
        setStatus("checking");
      },
      "expired-callback"() {
        emit("token", "");
        setStatus("expired");
      },
      "error-callback"() {
        emit("token", "");
        setStatus("error");
      },
    });
  }

  function reset() {
    emit("token", "");
    setStatus("loading");
    if (widgetId !== undefined) window.turnstile?.reset(widgetId);
  }

  defineExpose({ reset });
  onMounted(render);
  onBeforeUnmount(() => {
    clearTimeout(retryTimer);
    if (widgetId !== undefined) window.turnstile?.remove(widgetId);
  });
</script>

<template>
  <div>
    <div class="hidden">
      <div ref="container" />
    </div>
    <p
      class="mt-1 text-sm"
      :class="
        status === 'verified'
          ? 'text-success'
          : status === 'error' || status === 'expired'
            ? 'text-error'
            : 'fg-muted'
      "
      aria-live="polite"
    >
      {{
        status === "verified"
          ? "確認完了"
          : status === "checking"
            ? "人間かどうか確認中..."
            : status === "expired"
              ? "確認の期限が切れました。"
              : status === "error"
                ? "確認中にエラーが発生しました。"
                : "セキュリティ確認を読み込み中..."
      }}
    </p>
  </div>
</template>
