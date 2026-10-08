<script setup lang="ts">
  definePageMeta({
    title: "よくある質問",
    description: "マシュマロなどから",
    navigation: { parent: "/", order: 5 },
  });
  const groups = [
    {
      title: "活動",
      faqs: [
        {
          question: "週１参加でも良いですか？",
          answers: [
            "大丈夫です。",
            "キャンパス間移動は負担になりますので、可能な範囲の参加でOKです！",
          ],
        },
        {
          question: "ピアスって大丈夫ですか？",
          answers: [
            "外れたら危険なため、活動時は外してください。ネイルも危ないのでなしでお願いしています。髪染めは全然オッケーです。",
          ],
        },
        {
          question: "先輩後輩の上下関係は厳しいですか？",
          answers: [
            "厳しくはないと思います。学年関係なく仲良くしています。",
            "武道ですので、最低限の礼儀は身につけて欲しくはあります。",
          ],
        },
        {
          question: "他の合気道部との違いってなんですか？",
          answers: [
            "女子合気道部さんは大阪女子大学からの歴史を持つ団体で、同じ合気会の会派です。",
            "体育会合気道部さんは競技合気道という別の流派を稽古されています。",
          ],
        },
        {
          question: "夏休みなど長期休暇の活動はどのような感じですか？",
          answers: [
            "夏休みなど長期休暇の活動は、通常の稽古と同じです。",
            "それにプラスして合宿などがあります。",
          ],
        },
      ],
    },
    {
      title: "新歓",
      faqs: [
        {
          question: "今日体験行っていいですか？",
          answers: ["いつでもお越しください！ 稽古予定をご確認ください。"],
        },
        {
          question: "新歓はいつまでですか？",
          answers: ["見学・体験・入部に期限はありません。"],
        },
        {
          question: "入部したい場合はどうすればいいですか？",
          answers: ["先輩に直接、またはLINEなどで入部したいと伝えていただければ案内します。"],
        },
      ],
    },
    {
      title: "稽古",
      faqs: [
        {
          question: "師範などはいますか？",
          answers: [
            "天之武産合氣塾道場に属し、道場へ教わりに行ったり、師範に大学へ来ていただいたりしています。",
          ],
        },
        {
          question: "初心者でもついていけますか？",
          answers: ["はい。ほとんどの部員は大学から合気道を始めています。"],
        },
        {
          question: "合気道って強くなれますか？",
          answers: ["何を強さとするか次第ですが、殴り合いを避けられる落ち着きも立派な強さです。"],
        },
      ],
    },
  ];
</script>

<template>
  <h1 class="h1" id="faq">よくある質問</h1>
  <article class="my-4" aria-labelledby="faq">
    <section v-for="group in groups" :key="group.title">
      <h2 class="h2 mb-2 mt-6">{{ group.title }}</h2>
      <ul class="grid grid-cols-1 gap-4 p-0 md:grid-cols-2">
        <li v-for="faq in group.faqs" :key="faq.question" class="card list-none bg-opacity-60">
          <h3 class="h4 inline-flex items-center gap-2">
            <span class="i-ri:questionnaire-line" aria-hidden="true" />{{ faq.question }}
          </h3>
          <hr class="my-2 opacity-50 fg-accent" />
          <p v-for="answer in faq.answers" :key="answer" class="m-0 indent-1em text-sm fg-base">
            {{ answer }}
          </p>
        </li>
      </ul>
    </section>
  </article>
  <p>
    まだ知りたいことがありますか？
    <NuxtLink to="/contact" class="link">お問い合わせ</NuxtLink>や<a
      href="https://marshmallow-qa.com/8f2ofku54h476je"
      target="_blank"
      rel="noopener noreferrer"
      class="outer_link"
      >マシュマロ</a
    >からご質問下さい。
  </p>
</template>
