import { onMounted, ref, type Ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { wazadata } from "../utils/lotAikido/data";
import { generateTechniques } from "../utils/lotAikido/generate";
import type { WazaType } from "../utils/lotAikido/types";

const DEFAULT_RANK = 5;
const DEFAULT_FILTER = "under";
const DEFAULT_COUNT = 10;
const MAX_SEED = 1_000_000;

export const rankOptions = [
  { value: 5, label: "5級" },
  { value: 3, label: "3級" },
  { value: 1, label: "1級" },
  { value: -1, label: "初段" },
];

export const filterOptions = [
  { value: "under", label: "以下" },
  { value: "only", label: "のみ" },
  { value: "over", label: "以上" },
];

const randomSeed = () => Math.floor(Math.random() * MAX_SEED);

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function useGenerator() {
  const route = useRoute();
  const router = useRouter();
  const rank: Ref<number> = ref(DEFAULT_RANK);
  const filter: Ref<string> = ref(DEFAULT_FILTER);
  const count: Ref<number> = ref(DEFAULT_COUNT);
  const sortEnabled: Ref<boolean> = ref(false);
  const positive: Ref<string[]> = ref([]);
  const negative: Ref<string[]> = ref([]);
  const seed: Ref<number> = ref(0);
  const techniques: Ref<WazaType[]> = ref([]);
  const isInitialized = ref(false);
  const hasSeedInUrl = queryString(route.query.seed) !== undefined;

  function initFromUrl() {
    const query = route.query;
    rank.value = Number(query.rank) || DEFAULT_RANK;
    filter.value = queryString(query.filter) || DEFAULT_FILTER;
    count.value = Number(query.count) || DEFAULT_COUNT;
    sortEnabled.value = query.sort === "true";
    positive.value = queryString(query.positive)?.split(",") ?? [];
    negative.value = queryString(query.negative)?.split(",") ?? [];
    seed.value = hasSeedInUrl ? Number(query.seed) || 0 : 0;
    isInitialized.value = true;
  }

  function syncToUrl() {
    if (!isInitialized.value) return;
    const query: Record<string, string> = {};
    if (rank.value !== DEFAULT_RANK) query.rank = String(rank.value);
    if (filter.value !== DEFAULT_FILTER) query.filter = filter.value;
    if (count.value !== DEFAULT_COUNT) query.count = String(count.value);
    if (sortEnabled.value) query.sort = "true";
    if (positive.value.length) query.positive = positive.value.join(",");
    if (negative.value.length) query.negative = negative.value.join(",");
    if (seed.value) query.seed = String(seed.value);
    void router.replace({ query }).catch(() => {});
  }

  function generate() {
    techniques.value = generateTechniques(
      {
        rank: rank.value,
        filter: filter.value,
        count: count.value,
        sortEnabled: sortEnabled.value,
        positive: positive.value,
        negative: negative.value,
        seed: seed.value,
      },
      wazadata,
    );
    syncToUrl();
  }

  function shuffle() {
    seed.value = randomSeed();
    generate();
  }

  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("seed", String(seed.value));
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url.toString();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    return true;
  }

  watch(
    [rank, filter, count, sortEnabled, positive, negative],
    () => {
      if (isInitialized.value) generate();
    },
    { deep: true },
  );

  initFromUrl();
  generate();
  onMounted(() => {
    if (!hasSeedInUrl) shuffle();
  });

  return {
    rank,
    filter,
    count,
    sortEnabled,
    positive,
    negative,
    seed,
    techniques,
    rankOptions,
    filterOptions,
    generate,
    shuffle,
    share,
  };
}
