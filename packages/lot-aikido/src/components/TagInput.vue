<script setup lang="ts">
  import { css } from "styled-system/css";
  import { button, control } from "styled-system/recipes";
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
  const field = css({ minW: "0" });
  const labelClass = css({ mb: "1", display: "block", fontSize: "sm", lineHeight: "sm" });
  const inputClass = [control(), css({ w: "full", fontSize: "base", lineHeight: "normal" })];
  const tags = css({ mt: "2", display: "flex", flexWrap: "wrap", gap: "1.5" });
  // recipe の button は focus-visible の 1px ring を持たない。shortcut は持っていた。
  const buttonFocus = css({
    _focusVisible: { boxShadow: "ring", _hover: { boxShadow: "ringRaised" } },
  });
  const tagButton = [
    button({ tone: "base" }),
    buttonFocus,
    css({
      display: "inline-flex",
      alignItems: "center",
      gap: "1",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "full",
      px: "2",
      py: "1",
      fontSize: "xs",
      lineHeight: "xs",
    }),
  ];
  const tagPositive = css({ borderColor: "border.accent" });
  // 除外タグの枠は zinc-400/500。border.muted はダークが zinc-600。fg.ghost と同じ値。
  const tagNegative = css({ borderColor: "fg.ghost" });
  const tagTone = computed(() => (props.type === "positive" ? tagPositive : tagNegative));
  const removeIcon = css({ fontSize: "sm", lineHeight: "sm" });

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
  <div :class="field">
    <label :class="labelClass" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      v-model="inputText"
      :class="inputClass"
      type="text"
      :placeholder="placeholder || 'Enterで追加'"
      @keydown="onKeydown"
    />
    <div v-if="modelValue.length" :class="tags">
      <button
        v-for="tag in modelValue"
        :key="tag"
        type="button"
        :class="[tagButton, tagTone]"
        :title="`${tag} を削除`"
        @click="removeTag(tag)"
      >
        {{ tag }}
        <span :class="removeIcon" class="i-ri:close-line" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
