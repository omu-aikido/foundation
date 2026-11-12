<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, useId, watch } from "vue";

  interface Props {
    open: boolean;
    title: string;
    description?: string;
    contentClass?: string;
    testId?: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    "update:open": [open: boolean];
  }>();

  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = ref<HTMLDialogElement | null>(null);
  let pressedOutside = false;
  let acceptClose = true;

  // closedbyはSafari未対応。対象要素ではなく、枠の外で押して離したときだけ閉じる
  const needsOutsideDismiss =
    typeof HTMLDialogElement !== "undefined" && !("closedBy" in HTMLDialogElement.prototype);

  function outsideDialog(event: PointerEvent) {
    const dialog = dialogRef.value;
    if (!dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  }

  function onPointerDown(event: PointerEvent) {
    if (!needsOutsideDismiss || event.button !== 0) return;
    pressedOutside = outsideDialog(event);
  }

  function onPointerUp(event: PointerEvent) {
    if (!needsOutsideDismiss) return;
    const dismiss = pressedOutside && event.button === 0 && outsideDialog(event);
    pressedOutside = false;
    if (dismiss) dialogRef.value?.close();
  }

  function onPointerCancel() {
    pressedOutside = false;
  }

  function syncDialog(open: boolean) {
    const dialog = dialogRef.value;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
  }

  function onDialogClose() {
    if (acceptClose && props.open) emit("update:open", false);
  }

  watch(
    () => props.open,
    (open) => {
      syncDialog(open);
    },
  );

  onMounted(() => {
    syncDialog(props.open);
  });

  onBeforeUnmount(() => {
    acceptClose = false;
    if (dialogRef.value?.open) dialogRef.value.close();
  });
</script>

<template>
  <dialog
    ref="dialogRef"
    closedby="any"
    :class="['w-[calc(100%-2rem)]', contentClass]"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    :data-testid="testId"
    @close="onDialogClose"
    @pointercancel="onPointerCancel"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <div :id="titleId">
      <slot name="title">
        <h2 class="text-lg font-bold text">{{ title }}</h2>
      </slot>
    </div>
    <div v-if="description" :id="descriptionId">
      <slot name="description">
        <p class="mt-2 text-sub">{{ description }}</p>
      </slot>
    </div>
    <slot />
  </dialog>
</template>

<style scoped>
  dialog:modal {
    overscroll-behavior: contain;
  }

  dialog::backdrop {
    overflow: hidden;
    overscroll-behavior: contain;
    background: rgb(0 0 0 / 50%);
    backdrop-filter: blur(4px);
  }
</style>
