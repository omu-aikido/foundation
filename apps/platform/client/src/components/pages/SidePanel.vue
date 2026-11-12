<script setup lang="ts">
  import { onBeforeUnmount, ref, useId } from "vue";
  import { RouterLink, useRoute } from "vue-router";
  import { Show, SignOutButton, UserAvatar } from "@clerk/vue";

  const route = useRoute();
  const dialogId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = ref<HTMLDialogElement | null>(null);
  const expanded = ref(false);
  let pressedOutside = false;
  let acceptClose = true;

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

  function openMenu() {
    const dialog = dialogRef.value;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    expanded.value = true;
  }

  function closeMenu() {
    dialogRef.value?.close();
  }

  function onDialogClose() {
    if (!acceptClose) return;
    expanded.value = false;
  }

  function current(path: string) {
    return route.path === path ? "page" : undefined;
  }

  onBeforeUnmount(() => {
    acceptClose = false;
    if (dialogRef.value?.open) dialogRef.value.close();
  });
</script>

<template>
  <button
    type="button"
    class="w-8 h-8 m-4"
    aria-label="メニューを開く"
    :aria-expanded="expanded ? 'true' : 'false'"
    :aria-controls="dialogId"
    @click="openMenu"
  >
    <div class="i-lucide:menu" />
  </button>

  <dialog
    :id="dialogId"
    ref="dialogRef"
    class="side-panel-dialog"
    closedby="any"
    :aria-labelledby="titleId"
    :aria-describedby="descriptionId"
    @close="onDialogClose"
    @pointercancel="onPointerCancel"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <h2 :id="titleId" class="sr-only">サイドメニュー</h2>
    <p :id="descriptionId" class="sr-only">メニューを開いてページを移動できます</p>

    <div class="drawer-header mt-4 mr-4 flex justify-end">
      <button
        type="button"
        class="close-btn"
        aria-label="メニューを閉じる"
        autofocus
        @click="closeMenu"
      >
        <div class="i-lucide:panel-right-close" />
      </button>
    </div>

    <div class="mx-5">
      <Show when="signed-in">
        <nav class="mt-6 gap-5 flex flex-col">
          <RouterLink
            to="/"
            class="flex-inline gap-2 text items-center"
            :aria-current="current('/')"
            @click="closeMenu"
          >
            <div class="i-lucide:layout-dashboard" />
            トップ
          </RouterLink>
          <RouterLink
            to="/record"
            class="flex-inline gap-2 text items-center"
            :aria-current="current('/record')"
            @click="closeMenu"
          >
            <div class="i-lucide:clipboard-list" />
            活動記録
          </RouterLink>
          <RouterLink
            to="/account"
            class="flex-inline gap-2 text items-center"
            :aria-current="current('/account')"
            @click="closeMenu"
          >
            <UserAvatar alt="User Avatar" rounded />
            アカウント設定
          </RouterLink>
          <hr />
          <a
            href="https://omu-aikido.com/calendar"
            class="flex-inline gap-2 text items-center"
            target="_blank"
            rel="noopener noreferrer"
            @click="closeMenu"
          >
            <div class="i-lucide:calendar" />
            カレンダー ↗
          </a>
          <a
            href="https://omu-aikido.com/apps"
            class="flex-inline gap-2 text items-center"
            target="_blank"
            rel="noopener noreferrer"
            @click="closeMenu"
          >
            <div class="i-lucide:tool-case" />
            便利ツール ↗
          </a>
        </nav>
      </Show>
    </div>

    <Show when="signed-in">
      <hr class="my-5 mx-2" />
      <SignOutButton>
        <button type="button" class="gap-2 mx-5 text flex w-full items-center">
          <div class="i-lucide:log-out" />
          ログアウト
        </button>
      </SignOutButton>
    </Show>
  </dialog>
</template>

<style scoped>
  .side-panel-dialog {
    position: fixed;
    inset: 0 0 0 auto;
    width: min(100%, 20rem);
    height: 100%;
    max-height: 100%;
    margin: 0;
    border: none;
    padding: 0;
    background: var(--color-base);
    color: var(--color-text);
    opacity: 0.9;
  }

  .side-panel-dialog:modal {
    overscroll-behavior: contain;
  }

  .side-panel-dialog::backdrop {
    overflow: hidden;
    overscroll-behavior: contain;
    background: rgb(0 0 0 / 50%);
    backdrop-filter: blur(4px);
  }

  @media (prefers-reduced-motion: no-preference) {
    .side-panel-dialog {
      transform: translateX(100%);
      transition-property: transform, overlay, display;
      transition-duration: 200ms;
      transition-timing-function: ease-in;
      transition-behavior: allow-discrete;
    }

    .side-panel-dialog[open] {
      transform: translateX(0);
      transition-duration: 300ms;
      transition-timing-function: ease-out;
    }

    .side-panel-dialog::backdrop {
      background: transparent;
      transition-property: background-color, overlay, display;
      transition-duration: 200ms;
      transition-timing-function: ease-in;
      transition-behavior: allow-discrete;
    }

    .side-panel-dialog[open]::backdrop {
      background: rgb(0 0 0 / 50%);
      transition-duration: 300ms;
      transition-timing-function: ease-out;
    }

    @starting-style {
      .side-panel-dialog[open] {
        transform: translateX(100%);
      }

      .side-panel-dialog[open]::backdrop {
        background: transparent;
      }
    }
  }
</style>
