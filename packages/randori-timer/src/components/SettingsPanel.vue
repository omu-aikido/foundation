<script setup lang="ts">
  import { ref, useId } from "vue";
  import {
    builtInRandoriPresets,
    formatDurations,
    type RandoriPreset,
  } from "../utils/randoriTimer/randoriTimer";
  import type { RandoriPlaybackMode, RandoriTimerStatus } from "../composables/useRandoriTimer";

  const props = defineProps<{
    customPresets: RandoriPreset[];
    durations: number[];
    backgroundPlaybackAvailable: boolean;
    playbackError: unknown;
    playbackMode: RandoriPlaybackMode;
    preparationError: unknown;
    selectedId: string;
    settingsLocked: boolean;
    status: RandoriTimerStatus;
    totalDuration: number;
  }>();

  const emit = defineEmits<{
    deletePreset: [id: string];
    savePreset: [name: string];
    setDurations: [durations: number[], presetId?: string];
    retryPreparation: [];
    setPlaybackMode: [mode: RandoriPlaybackMode];
  }>();

  const bulkCount = ref(3);
  const bulkSeconds = ref(30);
  const presetName = ref("");
  const presetNameId = useId();

  function applyBulkEdit() {
    const count = Math.max(1, Math.min(20, Math.round(bulkCount.value || 1)));
    const seconds = clampSeconds(bulkSeconds.value);
    bulkCount.value = count;
    bulkSeconds.value = seconds;
    emit(
      "setDurations",
      Array.from({ length: count }, () => seconds),
    );
  }

  function updateDuration(index: number, value: number) {
    const updated = [...props.durations];
    updated[index] = clampSeconds(value);
    emit("setDurations", updated);
  }

  function addPerson() {
    if (props.durations.length >= 20) return;
    emit("setDurations", [...props.durations, props.durations.at(-1) ?? bulkSeconds.value]);
    bulkCount.value = props.durations.length + 1;
  }

  function removePerson(index: number) {
    if (props.durations.length === 1) return;
    emit(
      "setDurations",
      props.durations.filter((_, itemIndex) => itemIndex !== index),
    );
    bulkCount.value = props.durations.length - 1;
  }

  function savePreset() {
    if (!presetName.value.trim()) return;
    emit("savePreset", presetName.value);
    presetName.value = "";
  }

  function clampSeconds(value: number) {
    return Math.max(5, Math.min(600, Math.round(value || 5)));
  }

  function formatTotalDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return remainder ? `${minutes}分${remainder}秒` : `${minutes}分`;
  }
</script>

<template>
  <p class="mx-4 mt-2 text-sm fg-muted">
    <template v-if="playbackMode === 'background'">
      他のアプリを開いている間も合図音を再生します。端末やOSの状態によって停止する場合があります。
    </template>
    <template v-else>
      画面を閉じたり他のアプリへ移動するとサウンドが停止する場合があります。
    </template>
  </p>

  <section
    class="mt-8"
    :class="{ 'pointer-events-none opacity-55': settingsLocked }"
    :aria-disabled="settingsLocked"
  >
    <div class="mt-4 grid gap-3 sm:grid-cols-2" aria-label="組み込みプリセット">
      <button
        v-for="preset in builtInRandoriPresets"
        :key="preset.id"
        type="button"
        class="button base bordered-muted border p-4 text-left"
        :class="
          selectedId === preset.id ? 'bordered-accent ring-1 ring-sky-600 dark:ring-sky-500' : ''
        "
        :disabled="settingsLocked"
        @click="$emit('setDurations', preset.durations, preset.id)"
      >
        <span class="block text-lg font-bold">{{ preset.name }}</span
        ><span class="mt-1 block text-sm fg-muted">{{ formatDurations(preset.durations) }}</span>
      </button>
    </div>

    <div class="mt-5">
      <ol class="mt-2 overflow-hidden rounded border bordered-muted bg-base">
        <li
          v-for="(duration, index) in durations"
          :key="index"
          class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 bordered-base"
        >
          <label class="flex flex-1 items-center justify-between gap-4"
            ><span class="font-bold">{{ index + 1 }}人目</span
            ><span class="relative w-32"
              ><input
                :value="duration"
                class="control w-full pr-9 text-right font-mono tabular-nums"
                type="number"
                min="5"
                max="600"
                step="5"
                :aria-label="`${index + 1}人目の持ち時間`"
                @change="updateDuration(index, Number(($event.target as HTMLInputElement).value))"
              /><span class="pointer-events-none absolute right-3 top-2 fg-muted">秒</span></span
            ></label
          >
          <button
            type="button"
            class="button p-2 fg-muted hover:text-red-600 before:i-ri:delete-bin-line before:content-empty"
            :disabled="durations.length === 1"
            :aria-label="`${index + 1}人目を削除`"
            @click="removePerson(index)"
          />
        </li>
      </ol>
      <button
        type="button"
        class="button base bordered-muted mt-2 w-full border border-dashed py-2 fg-muted before:i-ri:add-fill before:mr-1 before:content-empty"
        :disabled="durations.length >= 20"
        @click="addPerson"
      >
        人を追加
      </button>
    </div>

    <details class="mt-5 rounded border bordered-muted bg-ghost p-4">
      <summary class="cursor-pointer font-bold">一括編集</summary>
      <div class="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label class="stack gap-1 fg-muted">
          人数
          <span class="relative">
            <input
              v-model.number="bulkCount"
              class="control w-full pr-9"
              type="number"
              min="1"
              max="20"
            />
            <span class="pointer-events-none absolute right-3 top-2 fg-muted"> 人 </span>
          </span>
        </label>
        <label class="stack gap-1 fg-muted">
          時間
          <span class="relative">
            <input
              v-model.number="bulkSeconds"
              class="control w-full pr-9"
              type="number"
              min="5"
              max="600"
              step="5"
            />
            <span class="pointer-events-none absolute right-3 top-2 fg-muted"> 秒 </span>
          </span>
        </label>
        <button
          type="button"
          class="button base bordered-muted border px-4 py-2"
          @click="applyBulkEdit"
        >
          全員に反映
        </button>
      </div>
    </details>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <label class="text-sm" :for="presetNameId">プリセット名</label>
      <input
        :id="presetNameId"
        v-model="presetName"
        class="control min-w-0 flex-1"
        type="text"
        maxlength="20"
        placeholder="この設定に名前をつける"
        @keyup.enter="savePreset"
      />
      <button
        type="button"
        class="button accent px-4 py-2 before:i-ri:add-line before:mr-1 before:content-empty"
        :disabled="!presetName.trim()"
        @click="savePreset"
      >
        保存
      </button>
    </div>

    <div v-if="customPresets.length" class="mt-3 divide-y bordered-muted border-y">
      <div v-for="preset in customPresets" :key="preset.id" class="flex items-center">
        <button
          type="button"
          class="button flex-1 px-1 py-3 text-left"
          @click="$emit('setDurations', preset.durations, preset.id)"
        >
          <span class="block font-bold">{{ preset.name }}</span
          ><span class="block text-sm fg-muted">{{ formatDurations(preset.durations) }}</span>
        </button>
        <button
          type="button"
          class="button p-3 fg-muted hover:text-red-600 before:i-ri:delete-bin-line before:content-empty"
          :aria-label="`${preset.name}を削除`"
          @click="$emit('deletePreset', preset.id)"
        />
      </div>
    </div>
  </section>

  <section class="mt-8" aria-labelledby="randori-playback-heading">
    <fieldset
      class="mt-2 overflow-hidden rounded border bordered-muted bg-base"
      :class="{ 'pointer-events-none opacity-55': settingsLocked }"
      :disabled="settingsLocked"
    >
      <label
        class="flex cursor-pointer gap-3 border-b px-4 py-3 bordered-muted"
        :class="playbackMode === 'normal' ? 'bg-sky-600/8' : ''"
      >
        <input
          type="radio"
          name="randori-playback-mode"
          value="normal"
          :checked="playbackMode === 'normal'"
          @change="$emit('setPlaybackMode', 'normal')"
        />
        <span>
          <span class="block font-bold">画面を開いたまま使う</span>
          <span class="mt-1 block text-sm fg-muted"> この画面を離れると停止します </span>
        </span>
      </label>
      <label
        class="flex gap-3 px-4 py-3"
        :class="[
          backgroundPlaybackAvailable ? 'cursor-pointer' : 'cursor-not-allowed',
          playbackMode === 'background' ? 'bg-sky-600/8' : '',
        ]"
      >
        <input
          type="radio"
          name="randori-playback-mode"
          value="background"
          :checked="playbackMode === 'background'"
          :disabled="!backgroundPlaybackAvailable"
          @change="$emit('setPlaybackMode', 'background')"
        />
        <span>
          <span class="block font-bold">他のアプリを使いながら</span>
          <span class="mt-1 block text-sm fg-muted"> 画面を離れても合図音を再生します。 </span>
        </span>
      </label>
    </fieldset>
    <p v-if="!backgroundPlaybackAvailable" class="mt-3 text-sm text-amber-700 dark:text-amber-400">
      バックグラウンド再生は合計10分まで利用できます。現在の設定:
      {{ formatTotalDuration(totalDuration) }}
    </p>
    <p v-if="status === 'preparing'" class="mt-3 text-sm fg-muted">
      バックグラウンド音声を準備しています…
    </p>
    <div v-if="preparationError" class="mt-3 text-sm text-red-700 dark:text-red-400">
      <p>バックグラウンド音声の準備に失敗しました。</p>
      <button
        type="button"
        class="button base bordered-muted mt-2 border px-3 py-2"
        @click="$emit('retryPreparation')"
      >
        再試行
      </button>
    </div>
    <p v-if="playbackError" class="mt-3 text-sm text-red-700 dark:text-red-400">
      バックグラウンド音声を再生できませんでした。端末の音声設定を確認して、リセット後に再試行してください。
    </p>
  </section>
</template>
