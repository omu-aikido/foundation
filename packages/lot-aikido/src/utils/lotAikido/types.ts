export type WazaType = {
  id: number;
  waza_in: string;
  waza_out: string;
  rank: number;
};

export const 攻め = {
  正面: "正面打ち",
  横面: "横面打ち",
  突き: "突き",

  片手: "片手取り",
  交差: "交差取り",
  諸手: "諸手取り",
  両手: "両手取り",

  袖口: "袖口取り",
  袖: "袖取り",
  肩: "肩取り",
  胸: "胸取り",

  両肩: "両肩取り",
  後ろ両手: "後ろ両手取り",

  後ろ胸: "後ろ胸取り",
  後ろ襟: "後ろ襟取り",
} as const;

export const 体勢 = {
  立ち技: "",
  半身半立ち: "半身半立ち",
  座技: "座技",
} as const;

export const 技 = {
  四方: "四方投げ",
  小手: "小手返し",
  入り身: "入り身投げ",
  回転: { 内: "内回転投げ", 外: "外回転投げ" },
  呼吸: "呼吸投げ",
  教: {
    一: { 表: "一教（表）", 裏: "一教（裏）" },
    二: { 表: "二教（表）", 裏: "二教（裏）" },
    三: { 表: "三教（表）", 裏: "三教（裏）" },
    四: { 表: "四教（表）", 裏: "四教（裏）" },
  },
  五教: { 表: "五教（表）", 裏: "五教（裏）" },
  側方入り身: "側方入り身投げ",
  天秤: "天秤投げ",
  十字: "十字投げ",
  天地: "天地投げ",
  腰投げ: "腰投げ",
  腕絡み: "腕絡み",
  隅: "隅落とし",
} as const;

type ValueOf<T> = T[keyof T];

type 末端値<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? 末端値<ValueOf<T>>
    : never;

type 技の束<T> = T extends string
  ? never
  : T extends Record<string, unknown>
    ? T | 技の束<ValueOf<T>>
    : never;

export type 攻め方 = ValueOf<typeof 攻め>;
export type 体勢名 = ValueOf<typeof 体勢>;
export type 技名 = 末端値<typeof 技>;
export type 技指定 = 技名 | 技の束<typeof 技>;

export type 技組み合わせ =
  | {
      攻め: 攻め方;
      技: 技指定;
      体勢?: 体勢名;
    }
  | {
      基本動作: "座技呼吸法" | "体の転換";
    };

export type 除外条件 = {
  攻め?: 攻め方;
  技?: 技指定;
  体勢?: 体勢名;
};

export type 直積合成 = {
  攻め: readonly 攻め方[];
  技: readonly 技指定[];
  体勢?: readonly 体勢名[];
  除外?: readonly 除外条件[];
  組み合わせ?: never;
};

export type 列挙 = {
  組み合わせ: readonly 技組み合わせ[];
  攻め?: never;
  技?: never;
  体勢?: never;
};

export type 技一覧 = 直積合成 | 列挙;

export type 級段位別 = {
  級段位: number;
  技一覧: readonly 技一覧[];
};
