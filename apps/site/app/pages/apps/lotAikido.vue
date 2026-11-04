<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { button } from "~~/styled-system/recipes";
  import { ref } from "vue";
  import { useGenerator } from "lot-aikido";
  import GeneratorForm from "lot-aikido/components/GeneratorForm.vue";
  import TagInput from "lot-aikido/components/TagInput.vue";
  import WazaTable from "lot-aikido/components/WazaTable.vue";

  definePageMeta({
    title: "合気道 技ジェネレーター",
    description:
      "条件を指定して、合気道の稽古技をランダムに選びます。技の候補を並べた稽古リストの作成にも使えます。",
    navigation: { parent: "/apps", order: 1 },
  });

  const gen = useGenerator();
  const copied = ref(false);
  const page = css({ mx: "auto", maxW: "3xl" });
  const body = css({ overflow: "hidden" });
  const tags = css({
    display: "grid",
    gap: "2",
    md: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  });
  const shareRow = css({ mt: "5", display: "flex", justifyContent: "right" });
  const shareButton = [
    button({ tone: "base" }),
    css({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.muted",
      px: "4",
      py: "2",
      fontSize: "sm",
      lineHeight: "sm",
    }),
  ];
  const shareCopied = css({ borderColor: "border.accent", color: "fg.accent" });
  // 中のアイコン span を行ボックスに入れない。inline のままだと 2px 伸びる。
  const shareIcon = css({ display: "inline-flex", mr: "1.5", verticalAlign: "text-bottom" });

  async function handleShare() {
    await gen.share();
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
</script>

<template>
  <section :class="page">
    <div :class="body">
      <GeneratorForm
        :count="gen.count.value"
        :filter="gen.filter.value"
        :filter-options="gen.filterOptions"
        :rank="gen.rank.value"
        :rank-options="gen.rankOptions"
        :sort-enabled="gen.sortEnabled.value"
        @shuffle="gen.shuffle()"
        @update:count="gen.count.value = $event"
        @update:filter="gen.filter.value = $event"
        @update:rank="gen.rank.value = $event"
        @update:sort-enabled="gen.sortEnabled.value = $event"
      />
      <section :class="tags">
        <TagInput
          label="含める技"
          placeholder="含める技名を入力"
          type="positive"
          :model-value="gen.positive.value"
          @update:model-value="gen.positive.value = $event"
        />
        <TagInput
          label="除外する技"
          placeholder="除外する技名を入力"
          type="negative"
          :model-value="gen.negative.value"
          @update:model-value="gen.negative.value = $event"
        />
      </section>
      <WazaTable :techniques="gen.techniques.value" />
    </div>

    <div :class="shareRow">
      <button
        type="button"
        :class="copied ? [shareButton, shareCopied] : shareButton"
        @click="handleShare"
      >
        <span :class="shareIcon"><span class="i-ri:links-line" aria-hidden="true" /></span>
        {{ copied ? "URLをコピーしました" : "このリストを共有" }}
      </button>
    </div>
  </section>
</template>
