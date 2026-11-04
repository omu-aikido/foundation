<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { stack } from "~~/styled-system/patterns";
  import { control } from "~~/styled-system/recipes";

  withDefaults(
    defineProps<{
      id: string;
      label: string;
      modelValue: string;
      type?: "text" | "email";
      error?: string;
      required?: boolean;
      disabled?: boolean;
      rows?: number;
      autocomplete?: string;
    }>(),
    { type: "text", error: "", rows: 1 },
  );
  const emit = defineEmits<{ "update:modelValue": [value: string] }>();
  function update(event: Event) {
    emit("update:modelValue", (event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  const field = stack({ gap: "1" });
  const labelText = css({ fontSize: "sm", lineHeight: "sm", fontWeight: "bold", color: "fg.base" });
  const requiredMark = css({ fontWeight: "bold", color: "fg.error" });
  const input = control();
  const textarea = [control(), css({ resize: "vertical" })];
  const message = css({ mt: "1", fontSize: "xs", lineHeight: "xs", color: "fg.error" });
</script>

<template>
  <div :class="field">
    <label :for="id" :class="labelText">
      {{ label }}
      <span v-if="required" :class="requiredMark" aria-hidden="true">*</span>
    </label>
    <input
      v-if="rows === 1"
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      :class="input"
      @input="update"
    />
    <textarea
      v-else
      :id="id"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      :class="textarea"
      @input="update"
    />
    <p v-if="error" :id="`${id}-error`" :class="message">{{ error }}</p>
  </div>
</template>
