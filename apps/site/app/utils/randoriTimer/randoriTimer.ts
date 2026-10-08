export type RandoriPreset = {
  id: string;
  name: string;
  durations: number[];
  builtIn?: boolean;
};

export const builtInRandoriPresets: RandoriPreset[] = [
  {
    id: "three",
    name: "三人掛け（一級）",
    durations: [30, 30, 30],
    builtIn: true,
  },
  {
    id: "four",
    name: "四人掛け（初段）",
    durations: [30, 30, 30, 60],
    builtIn: true,
  },
];

export function formatDurations(durations: number[]) {
  return durations.map((seconds) => `${seconds}秒`).join(" / ");
}
