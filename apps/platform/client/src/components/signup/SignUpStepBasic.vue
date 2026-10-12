<template>
  <div ref="root" class="stack">
    <Input
      id="email"
      name="email"
      type="email"
      :model-value="formValues.email"
      label="メールアドレス"
      autocomplete="email"
      required
      placeholder="name@example.com"
      :disabled="isSignUpCreated"
      :error="formErrors.email"
      @update:model-value="onUpdate('email', $event ?? '')"
    />

    <div class="gap-2 flex flex-col">
      <PasswordInput
        id="password"
        name="password"
        autocomplete="new-password"
        :model-value="formValues.newPassword"
        label="パスワード"
        required
        placeholder="10文字以上のパスワード"
        :disabled="isSignUpCreated"
        :error="formErrors.newPassword"
        @update:model-value="onUpdate('newPassword', $event ?? '')"
      />
    </div>

    <div class="gap-2 flex flex-col">
      <PasswordInput
        id="password-confirm"
        :model-value="formValues.passwordConfirm"
        name="password-confirm"
        autocomplete="new-password"
        label="パスワード（確認）"
        required
        placeholder="パスワードを再入力"
        :disabled="isSignUpCreated"
        :error="formErrors.passwordConfirm"
        @update:model-value="onUpdate('passwordConfirm', $event ?? '')"
      />
    </div>

    <div class="pt-2 flex justify-end">
      <button
        type="button"
        class="btn-primary"
        :disabled="isSignUpCreated"
        @click="handleNextClick"
      >
        次へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Input from "@/components/ui/UiInput.vue";
  import PasswordInput from "@/components/ui/UiPasswordInput.vue";
  import { nextTick, ref } from "vue";
  import type * as useSignUpForm from "@/composable/useSignUpForm";

  const props = defineProps<{
    formValues: Partial<useSignUpForm.SignUpFormData>;
    formErrors: Partial<useSignUpForm.FormErrors>;
    isSignUpCreated: boolean;
    handleNext: () => void;
  }>();
  const emit = defineEmits<{
    (e: "update:formValue", key: keyof useSignUpForm.SignUpFormData, value: string | number): void;
  }>();
  const root = ref<HTMLElement | null>(null);
  const onUpdate = (key: keyof useSignUpForm.SignUpFormData, value: string | number) => {
    emit("update:formValue", key, value);
  };
  const handleNextClick = async () => {
    props.handleNext();
    await nextTick();
    root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  };
</script>
