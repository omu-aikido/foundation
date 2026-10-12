<script setup lang="ts">
  type Status = "loading" | "checking" | "verified" | "expired" | "error";
  const props = defineProps<{ siteKey: string }>();
  const emit = defineEmits<{ token: [value: string]; status: [value: Status] }>();
  const container = ref<HTMLElement>();
  const status = ref<Status>("loading");
  let widgetId: string | undefined;
  let disposed = false;
  let retries = 0;
  const maxRetries = 20;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  const scriptUrl = ref("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit");

  useHead({
    script: [
      {
        src: scriptUrl,
        defer: true,
        onload: onScriptReady,
        onerror: onScriptError,
      },
    ],
  });

  function setStatus(value: Status) {
    status.value = value;
    emit("status", value);
  }

  function retry() {
    clearTimeout(retryTimer);
    retries = 0;
    emit("token", "");
    setStatus("loading");
    if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId);
    else {
      scriptUrl.value = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&retry=${Date.now()}`;
      render();
    }
  }

  function render() {
    if (disposed) return;
    if (!props.siteKey || !container.value || !window.turnstile) {
      if (retries++ < maxRetries) retryTimer = setTimeout(render, 250);
      else setStatus("error");
      return;
    }
    retries = 0;
    try {
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
    } catch {
      emit("token", "");
      setStatus("error");
    }
  }

  function reset() {
    emit("token", "");
    setStatus("loading");
    if (widgetId !== undefined) window.turnstile?.reset(widgetId);
  }

  function onScriptReady() {
    if (disposed || widgetId !== undefined) return;
    clearTimeout(retryTimer);
    retries = 0;
    setStatus("checking");
    render();
  }
  function onScriptError() {
    if (disposed) return;
    clearTimeout(retryTimer);
    emit("token", "");
    setStatus("error");
  }

  defineExpose({ reset });
  onMounted(render);
  onBeforeUnmount(() => {
    disposed = true;
    clearTimeout(retryTimer);
    if (widgetId !== undefined) window.turnstile?.remove(widgetId);
  });
</script>

<template>
  <div>
    <div ref="container" />
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
                ? "確認に失敗しました。再試行してください。"
                : "セキュリティ確認を読み込み中..."
      }}
    </p>
    <button
      v-if="status === 'error' || status === 'expired'"
      type="button"
      class="button mt-2"
      @click="retry"
    >
      セキュリティ確認を再試行
    </button>
  </div>
</template>
