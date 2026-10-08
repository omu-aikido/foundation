<script setup lang="ts">
  import { validateContactFields } from "~~/shared/schemas/contact";

  type FieldName = "name" | "email" | "subject" | "body";
  type SubmitStatus = "idle" | "submitting" | "success" | "error";
  type TurnstileStatus = "loading" | "checking" | "verified" | "expired" | "error";

  const config = useRuntimeConfig();
  const form = reactive<Record<FieldName, string>>({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const fieldErrors = reactive<Record<FieldName, string>>({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const status = ref<SubmitStatus>("idle");
  const errorMessage = ref("");
  const turnstileStatus = ref<TurnstileStatus>("loading");
  const turnstileToken = ref("");
  const widget = ref<{ reset(): void }>();
  const siteKey = String(config.public.turnstileSiteKey ?? "");
  const ready = computed(
    () =>
      Object.values(form).every((value) => value.trim()) &&
      turnstileStatus.value === "verified" &&
      status.value !== "submitting",
  );

  function validate() {
    Object.keys(fieldErrors).forEach((key) => (fieldErrors[key as FieldName] = ""));
    const parsed = validateContactFields(form);
    if (parsed.success) return true;
    for (const [key, messages] of Object.entries(parsed.fields)) {
      const field = key as FieldName;
      if (field in fieldErrors && !fieldErrors[field]) fieldErrors[field] = messages[0] ?? "";
    }
    return false;
  }

  async function submit() {
    if (!validate()) {
      status.value = "error";
      return;
    }
    if (!turnstileToken.value) {
      status.value = "error";
      errorMessage.value = "チャレンジを完了してから送信してください。";
      return;
    }
    status.value = "submitting";
    errorMessage.value = "";
    const body = new FormData();
    for (const [key, value] of Object.entries(form)) body.set(key, value);
    body.set("cf-turnstile-response", turnstileToken.value);
    try {
      await $fetch("/api/contact", { method: "POST", body });
      status.value = "success";
      Object.keys(form).forEach((key) => (form[key as FieldName] = ""));
    } catch (error: unknown) {
      status.value = "error";
      const data = (
        error as {
          data?: { message?: string; fields?: Record<string, string[]> };
        }
      ).data;
      errorMessage.value =
        data?.message ?? "送信に失敗しました。しばらく経ってから再度お試しください。";
      for (const key of Object.keys(fieldErrors) as FieldName[]) {
        fieldErrors[key] = data?.fields?.[key]?.[0] ?? "";
      }
      widget.value?.reset();
    }
  }
</script>

<template>
  <div v-if="status === 'success'" role="alert" class="card text-center">
    <span class="i-ri:checkbox-circle-line mx-auto mb-3 block h-5 w-5 text-success" />
    <p class="text-lg font-bold fg-base">お問い合わせを受け付けました。</p>
    <p class="mt-1 fg-muted">ありがとうございます。</p>
  </div>
  <form v-else novalidate class="stack mt-4 gap-4" @submit.prevent="submit">
    <p v-if="status === 'error' && errorMessage" role="alert" class="text-error">
      {{ errorMessage }}
    </p>
    <FormInput
      id="cf-name"
      v-model="form.name"
      label="お名前"
      :error="fieldErrors.name"
      required
      autocomplete="name"
      :disabled="status === 'submitting'"
    />
    <FormInput
      id="cf-email"
      v-model="form.email"
      label="メールアドレス"
      type="email"
      :error="fieldErrors.email"
      required
      autocomplete="email"
      :disabled="status === 'submitting'"
    />
    <FormInput
      id="cf-subject"
      v-model="form.subject"
      label="件名"
      :error="fieldErrors.subject"
      required
      :disabled="status === 'submitting'"
    />
    <FormInput
      id="cf-body"
      v-model="form.body"
      label="お問い合わせ内容"
      :error="fieldErrors.body"
      required
      :rows="6"
      :disabled="status === 'submitting'"
    />
    <ClientOnly>
      <TurnstileWidget
        v-if="siteKey"
        ref="widget"
        :site-key="siteKey"
        @token="turnstileToken = $event"
        @status="turnstileStatus = $event"
      />
      <p v-else class="text-sm text-error">
        PUBLIC_CF_TURNSTILE_SITEKEY が未設定です。このままでは送信できません。
      </p>
      <template #fallback
        ><p class="text-sm fg-muted">セキュリティ確認を読み込んでいます...</p></template
      >
    </ClientOnly>
    <button type="submit" :disabled="!ready" class="button accent ml-auto w-fit px-4 py-2">
      {{ status === "submitting" ? "送信中..." : "送信する" }}
    </button>
  </form>
</template>
