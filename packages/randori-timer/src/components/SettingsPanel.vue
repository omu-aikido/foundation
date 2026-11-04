<script setup lang="ts">
  import { css } from "styled-system/css";
  import { stack } from "styled-system/patterns";
  import { button, control } from "styled-system/recipes";
  import IconRiAddFill from "~icons/ri/add-fill";
  import IconRiAddLine from "~icons/ri/add-line";
  import IconRiDeleteBinLine from "~icons/ri/delete-bin-line";
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

  const note = css({ mx: "4", mt: "2", fontSize: "sm", lineHeight: "sm", color: "fg.muted" });
  const settings = css({ mt: "8" });
  const locked = css({ pointerEvents: "none", opacity: "0.55" });
  const presets = css({
    mt: "4",
    display: "grid",
    gap: "3",
    sm: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  });
  // recipe の button は focus-visible の 1px ring を持たない。shortcut は持っていた。
  const buttonFocus = css({
    _focusVisible: { boxShadow: "ring", _hover: { boxShadow: "ringRaised" } },
  });
  const presetButton = [
    button({ tone: "base" }),
    buttonFocus,
    css({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.muted",
      p: "4",
      textAlign: "left",
    }),
  ];
  const presetSelected = css({
    borderColor: "border.accent",
    boxShadow: "ring",
    _hover: { boxShadow: "ringRaised" },
    // disabled の hover は影だけ消す。ring トークンを外すと選択枠まで消える。
    _disabled: { _hover: { boxShadow: "ring" } },
  });
  const presetTitle = css({
    display: "block",
    fontSize: "lg",
    lineHeight: "lg",
    fontWeight: "bold",
  });
  const presetMeta = css({
    mt: "1",
    display: "block",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.muted",
  });
  const rounds = css({ mt: "5" });
  const roundList = css({
    mt: "2",
    overflow: "hidden",
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
    bg: "bg.base",
  });
  const roundItem = css({
    display: "flex",
    alignItems: "center",
    gap: "3",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderColor: "border.base",
    px: "4",
    py: "3",
    "&:last-child": { borderBottomWidth: "0" },
  });
  const roundLabel = css({
    display: "flex",
    flex: "1",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "4",
  });
  const person = css({ fontWeight: "bold" });
  const durationBox = css({ position: "relative", w: "32" });
  // 単位が右に重なる。control の padding-inline だと右側が px-3 のまま。
  const inputPadEnd = css({ pr: "9" });
  const durationInput = [
    control(),
    inputPadEnd,
    css({ w: "full", textAlign: "right", fontFamily: "mono", fontVariantNumeric: "tabular-nums" }),
  ];
  const suffix = css({
    pointerEvents: "none",
    position: "absolute",
    right: "3",
    top: "2",
    color: "fg.muted",
  });
  const iconButton = [
    button(),
    buttonFocus,
    css({ p: "2", color: "fg.muted", _hover: { color: "fg.dangerHover" } }),
  ];
  const addPersonButton = [
    button({ tone: "base" }),
    buttonFocus,
    css({
      mt: "2",
      w: "full",
      borderWidth: "1px",
      borderStyle: "dashed",
      borderColor: "border.muted",
      py: "2",
      color: "fg.muted",
    }),
  ];
  const leadingIcon = css({ mr: "1" });
  const bulk = css({
    mt: "5",
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
    bg: "bg.ghost",
    p: "4",
  });
  const summaryClass = css({ cursor: "pointer", fontWeight: "bold" });
  const bulkGrid = css({
    mt: "4",
    display: "grid",
    alignItems: "flex-end",
    gap: "3",
    sm: { gridTemplateColumns: "1fr 1fr auto" },
  });
  const bulkField = [stack({ gap: "1" }), css({ color: "fg.muted" })];
  const bulkBox = css({ position: "relative" });
  const bulkInput = [control(), inputPadEnd, css({ w: "full" })];
  const applyButton = [
    button({ tone: "base" }),
    buttonFocus,
    css({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.muted",
      px: "4",
      py: "2",
    }),
  ];
  const saveRow = css({
    mt: "5",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2",
  });
  const saveLabel = css({ fontSize: "sm", lineHeight: "sm" });
  const presetNameInput = [control(), css({ minW: "0", flex: "1" })];
  const saveButton = [button({ tone: "accent" }), buttonFocus, css({ px: "4", py: "2" })];
  const customList = css({
    mt: "3",
    borderTopWidth: "1px",
    borderBottomWidth: "1px",
    borderTopStyle: "solid",
    borderBottomStyle: "solid",
    borderColor: "border.muted",
  });
  const customItem = css({
    display: "flex",
    alignItems: "center",
    "&:not(:last-child)": { borderBottomWidth: "1px", borderBottomStyle: "solid" },
  });
  const customButton = [
    button(),
    buttonFocus,
    css({ flex: "1", px: "1", py: "3", textAlign: "left" }),
  ];
  const customName = css({ display: "block", fontWeight: "bold" });
  const customMeta = css({ display: "block", fontSize: "sm", lineHeight: "sm", color: "fg.muted" });
  const customDelete = [
    button(),
    buttonFocus,
    css({ p: "3", color: "fg.muted", _hover: { color: "fg.dangerHover" } }),
  ];
  const playback = css({ mt: "8" });
  const modes = css({
    mt: "2",
    overflow: "hidden",
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
    bg: "bg.base",
  });
  const modeInput = control();
  const modeNormal = css({
    display: "flex",
    cursor: "pointer",
    gap: "3",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderColor: "border.muted",
    px: "4",
    py: "3",
  });
  const modeBackground = css({ display: "flex", gap: "3", px: "4", py: "3" });
  const modeClickable = css({ cursor: "pointer" });
  const modeBlocked = css({ cursor: "not-allowed" });
  const modeSelected = css({ bg: "bg.selected" });
  const modeTitle = css({ display: "block", fontWeight: "bold" });
  const modeHelp = css({
    mt: "1",
    display: "block",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.muted",
  });
  const caution = css({ mt: "3", fontSize: "sm", lineHeight: "sm", color: "fg.caution" });
  const preparingText = css({ mt: "3", fontSize: "sm", lineHeight: "sm", color: "fg.muted" });
  const failure = css({ mt: "3", fontSize: "sm", lineHeight: "sm", color: "fg.alert" });
  const retry = [
    button({ tone: "base" }),
    buttonFocus,
    css({
      mt: "2",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.muted",
      px: "3",
      py: "2",
    }),
  ];

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
  <p :class="note">
    <template v-if="playbackMode === 'background'">
      他のアプリを開いている間も合図音を再生します。端末やOSの状態によって停止する場合があります。
    </template>
    <template v-else>
      画面を閉じたり他のアプリへ移動するとサウンドが停止する場合があります。
    </template>
  </p>

  <section :class="[settings, settingsLocked && locked]" :aria-disabled="settingsLocked">
    <div :class="presets" aria-label="組み込みプリセット">
      <button
        v-for="preset in builtInRandoriPresets"
        :key="preset.id"
        type="button"
        :class="selectedId === preset.id ? [presetButton, presetSelected] : presetButton"
        :disabled="settingsLocked"
        @click="$emit('setDurations', preset.durations, preset.id)"
      >
        <span :class="presetTitle">{{ preset.name }}</span
        ><span :class="presetMeta">{{ formatDurations(preset.durations) }}</span>
      </button>
    </div>

    <div :class="rounds">
      <ol :class="roundList">
        <li v-for="(duration, index) in durations" :key="index" :class="roundItem">
          <label :class="roundLabel"
            ><span :class="person">{{ index + 1 }}人目</span
            ><span :class="durationBox"
              ><input
                :value="duration"
                :class="durationInput"
                type="number"
                min="5"
                max="600"
                step="5"
                :aria-label="`${index + 1}人目の持ち時間`"
                @change="updateDuration(index, Number(($event.target as HTMLInputElement).value))"
              /><span :class="suffix">秒</span></span
            ></label
          >
          <button
            type="button"
            :class="iconButton"
            :disabled="durations.length === 1"
            :aria-label="`${index + 1}人目を削除`"
            @click="removePerson(index)"
          >
            <IconRiDeleteBinLine aria-hidden="true" />
          </button>
        </li>
      </ol>
      <button
        type="button"
        :class="addPersonButton"
        :disabled="durations.length >= 20"
        @click="addPerson"
      >
        <IconRiAddFill :class="leadingIcon" aria-hidden="true" /> 人を追加
      </button>
    </div>

    <details :class="bulk">
      <summary :class="summaryClass">一括編集</summary>
      <div :class="bulkGrid">
        <label :class="bulkField">
          人数
          <span :class="bulkBox">
            <input v-model.number="bulkCount" :class="bulkInput" type="number" min="1" max="20" />
            <span :class="suffix"> 人 </span>
          </span>
        </label>
        <label :class="bulkField">
          時間
          <span :class="bulkBox">
            <input
              v-model.number="bulkSeconds"
              :class="bulkInput"
              type="number"
              min="5"
              max="600"
              step="5"
            />
            <span :class="suffix"> 秒 </span>
          </span>
        </label>
        <button type="button" :class="applyButton" @click="applyBulkEdit">全員に反映</button>
      </div>
    </details>

    <div :class="saveRow">
      <label :class="saveLabel" :for="presetNameId">プリセット名</label>
      <input
        :id="presetNameId"
        v-model="presetName"
        :class="presetNameInput"
        type="text"
        maxlength="20"
        placeholder="この設定に名前をつける"
        @keyup.enter="savePreset"
      />
      <button type="button" :class="saveButton" :disabled="!presetName.trim()" @click="savePreset">
        <IconRiAddLine :class="leadingIcon" aria-hidden="true" /> 保存
      </button>
    </div>

    <div v-if="customPresets.length" :class="customList">
      <div v-for="preset in customPresets" :key="preset.id" :class="customItem">
        <button
          type="button"
          :class="customButton"
          @click="$emit('setDurations', preset.durations, preset.id)"
        >
          <span :class="customName">{{ preset.name }}</span
          ><span :class="customMeta">{{ formatDurations(preset.durations) }}</span>
        </button>
        <button
          type="button"
          :class="customDelete"
          :aria-label="`${preset.name}を削除`"
          @click="$emit('deletePreset', preset.id)"
        >
          <IconRiDeleteBinLine aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>

  <section :class="playback" aria-labelledby="randori-playback-heading">
    <fieldset :class="[modes, settingsLocked && locked]" :disabled="settingsLocked">
      <label :class="[modeNormal, playbackMode === 'normal' && modeSelected]">
        <input
          :class="modeInput"
          type="radio"
          name="randori-playback-mode"
          value="normal"
          :checked="playbackMode === 'normal'"
          @change="$emit('setPlaybackMode', 'normal')"
        />
        <span>
          <span :class="modeTitle">画面を開いたまま使う</span>
          <span :class="modeHelp"> この画面を離れると停止します </span>
        </span>
      </label>
      <label
        :class="[
          modeBackground,
          backgroundPlaybackAvailable ? modeClickable : modeBlocked,
          playbackMode === 'background' && modeSelected,
        ]"
      >
        <input
          :class="modeInput"
          type="radio"
          name="randori-playback-mode"
          value="background"
          :checked="playbackMode === 'background'"
          :disabled="!backgroundPlaybackAvailable"
          @change="$emit('setPlaybackMode', 'background')"
        />
        <span>
          <span :class="modeTitle">他のアプリを使いながら</span>
          <span :class="modeHelp"> 画面を離れても合図音を再生します。 </span>
        </span>
      </label>
    </fieldset>
    <p v-if="!backgroundPlaybackAvailable" :class="caution">
      バックグラウンド再生は合計10分まで利用できます。現在の設定:
      {{ formatTotalDuration(totalDuration) }}
    </p>
    <p v-if="status === 'preparing'" :class="preparingText">
      バックグラウンド音声を準備しています…
    </p>
    <div v-if="preparationError" :class="failure">
      <p>バックグラウンド音声の準備に失敗しました。</p>
      <button type="button" :class="retry" @click="$emit('retryPreparation')">再試行</button>
    </div>
    <p v-if="playbackError" :class="failure">
      バックグラウンド音声を再生できませんでした。端末の音声設定を確認して、リセット後に再試行してください。
    </p>
  </section>
</template>
