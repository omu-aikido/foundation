<script setup lang="ts">
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
</script>

<template>
  <div class="stack gap-1">
    <label :for="id" class="text-sm font-bold fg-base">
      {{ label }}
      <span v-if="required" class="font-bold text-error" aria-hidden="true">*</span>
    </label>
    <input
      v-if="rows === 1"
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="control"
      @input="update"
    />
    <textarea
      v-else
      :id="id"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      class="control resize-y"
      @input="update"
    />
    <p v-if="error" class="mt-1 text-xs text-error">{{ error }}</p>
  </div>
</template>
