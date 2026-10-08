<script setup lang="ts">
  definePageMeta({
    title: "About",
    description: "活動概要",
    navigation: { parent: "/", order: 1 },
  });

  const schedule = [
    ["月曜日", "中百舌鳥キャンパス", "18:00〜20:00"],
    ["火曜日", "杉本キャンパス", "18:00〜20:00"],
    ["木曜日", "森之宮キャンパス", "19:00〜20:00"],
    ["金曜日", "杉本キャンパス", "18:00〜20:00"],
    ["土曜日", "中百舌鳥キャンパス", "18:00〜20:00"],
  ];
  const annual = [
    ["４月", "ふたば祭教室企画出店"],
    ["５月", "—"],
    ["６月", "合気道フェスティバル"],
    ["７月", "都立大戦"],
    ["８月", "道場特別稽古"],
    ["９月", "合宿"],
    ["10月", "旧三商大合同稽古"],
    ["11月", "六公立大戦／白鷺祭模擬店出店"],
    ["12月", "吹田市合気道演武大会"],
    ["１月", "—"],
    ["２月", "—"],
    ["３月", "道場特別稽古"],
  ];
  const info = [
    ["団体名称", "大阪公立大学合氣道部"],
    ["団体種別", "公認団体"],
    ["活動分類", "武道／スポーツ"],
    [
      "活動場所",
      "中百舌鳥キャンパス 武道場／杉本キャンパス 新武道場／森之宮キャンパス マルチユースルーム",
    ],
    ["引退時期", "特別の定めなし（幹部交代後も部活参加可能）"],
    ["部費", "5千円/6ヶ月"],
    ["部費以外の負担", "合宿費、遠征費（交通費、イベント参加費など）"],
    ["２年生以上の受入", "歓迎"],
    ["兼部・兼サー", "可能。ただし昇級・昇段には一定以上の稽古・道場イベントへの参加が必要です。"],
    ["バイトとの両立", "可能"],
    ["入部可能時期", "通年可能"],
    ["入部方法", "SNSのDM／飛び込み参加などで見学・体験を受け付けています。"],
  ];
  const history = [
    ["1964年", "大阪府立大学合氣道部が発足"],
    ["2018年10月", "大阪市立大学合気道サークルが発足"],
    ["2022年4月", "大学統合に伴い両団体が統合し、大阪公立大学合氣道部が発足"],
    [`〜${new Date().getFullYear()}年`, "現在に至る"],
  ];
</script>

<template>
  <MarkdownPage>
    <h1>About</h1>
    <p>
      <strong
        >2022年の春より、大阪市立大学合気道サークルと大阪府立大学合氣道部が統合し、大阪公立大学合氣道部として活動しています！</strong
      >
    </p>
    <p>
      大阪公立大学で唯一、中百舌鳥・杉本・森之宮の各キャンパスで活動する体育会所属の合気道部です。
    </p>
    <p>
      大阪府吹田市の天之武産合氣塾道場に門下として所属しています。<NuxtLink to="/about/links"
        >リンク集</NuxtLink
      >もご覧ください。
    </p>
    <h2>活動</h2>
    <h3>活動場所</h3>
    <ul>
      <li>森之宮キャンパス 2階 マルチユースルーム</li>
      <li>中百舌鳥キャンパス 体育館1階・武道場</li>
      <li>杉本キャンパス 新武道場</li>
    </ul>
    <p>詳細は<NuxtLink to="/access">稽古場所</NuxtLink>をご覧ください。</p>
    <h3>活動日</h3>
    <dl class="space-y-4">
      <div v-for="item in schedule" :key="item[0]">
        <dt class="font-bold">{{ item[0] }}</dt>
        <dd class="m-0">
          {{ item[1] }}<br /><span class="text-sm">{{ item[2] }}</span>
        </dd>
      </div>
    </dl>
    <p>詳しい予定は<NuxtLink to="/calendar">予定表</NuxtLink>をご確認ください。</p>
    <h3>年間行事予定</h3>
    <section class="my-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in annual"
        :key="item[0]"
        class="card"
        :class="item[1] === '—' && 'opacity-60'"
      >
        <p class="text-sm font-semibold fg-muted">{{ item[0] }}</p>
        <p class="mt-2 fg-muted">{{ item[1] }}</p>
      </div>
    </section>
    <p>※ 上記は主な年間行事予定です。詳細は変更される場合があります。</p>
    <h3>団体等基本情報</h3>
    <dl class="space-y-4">
      <div v-for="item in info" :key="item[0]">
        <dt class="text-sm font-bold">{{ item[0] }}</dt>
        <dd class="m-0 leading-relaxed">{{ item[1] }}</dd>
      </div>
    </dl>
    <h3>歴史</h3>
    <dl class="space-y-4">
      <div v-for="item in history" :key="item[0]">
        <dt class="text-sm font-bold">{{ item[0] }}</dt>
        <dd class="mt-1 leading-relaxed">{{ item[1] }}</dd>
      </div>
    </dl>
    <p>
      また、1968年から2018年4月まで、天之武産合氣塾道場門下の大阪市立大学体育会合氣道部が活動していました。別団体ではありますが、旧三商大合同稽古などのイベントを受け継いでいます。
    </p>
  </MarkdownPage>
</template>
