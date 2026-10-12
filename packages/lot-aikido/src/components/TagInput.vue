<script setup lang="ts">
  import { computed, ref, useId } from "vue";

  const props = defineProps<{
    modelValue: string[];
    type: "positive" | "negative";
    label: string;
    placeholder?: string;
  }>();

  const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
  const inputId = useId();
  const inputText = ref("");
  const tone = computed(() =>
    props.type === "positive"
      ? "border-sky-600 dark:border-sky-500"
      : "border-zinc-400 dark:border-zinc-500",
  );

  function addTag() {
    const tag = inputText.value.trim();
    if (!tag || props.modelValue.includes(tag)) return;
    emit("update:modelValue", [...props.modelValue, tag]);
    inputText.value = "";
  }

  function removeTag(tag: string) {
    emit(
      "update:modelValue",
      props.modelValue.filter((value) => value !== tag),
    );
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addTag();
  }
</script>

<template>
  <div class="min-w-0">
    <label class="mb-1 block text-sm" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      v-model="inputText"
      class="control w-full rounded-sm text-base"
      type="text"
      :placeholder="placeholder || 'Enterで追加'"
      @keydown="onKeydown"
    />
    <div v-if="modelValue.length" class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="tag in modelValue"
        :key="tag"
        type="button"
        class="button inline-flex items-center gap-1 rounded-full border bg-base px-2 py-1 text-xs fg-base"
        :class="tone"
        :title="`${tag} を削除`"
        @click="removeTag(tag)"
      >
        {{ tag }}
        <span class="i-ri:close-line text-sm" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
