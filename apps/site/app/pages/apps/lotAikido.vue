<script setup lang="ts">
  import { ref } from "vue";
  import { useGenerator } from "lot-aikido";
  import GeneratorForm from "lot-aikido/components/GeneratorForm.vue";
  import TagInput from "lot-aikido/components/TagInput.vue";
  import WazaTable from "lot-aikido/components/WazaTable.vue";

  definePageMeta({
    title: "合気道 技ジェネレーター",
    description:
      "条件を指定して、合気道の稽古技をランダムに選びます。技の候補を並べた稽古リストの作成にも使えます。",
  });

  const gen = useGenerator();
  const copied = ref(false);

  async function handleShare() {
    await gen.share();
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="overflow-hidden">
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
      <section class="grid gap-2 md:grid-cols-2">
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

    <div class="mt-5 flex justify-right">
      <button
        type="button"
        class="button base border px-4 py-2 text-sm bordered-muted"
        :class="copied ? 'bordered-accent fg-accent' : ''"
        @click="handleShare"
      >
        <span class="i-ri:links-line mr-1.5 align-text-bottom" aria-hidden="true" />
        {{ copied ? "URLをコピーしました" : "このリストを共有" }}
      </button>
    </div>
  </section>
</template>
