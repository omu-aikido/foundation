<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { card, link } from "~~/styled-system/recipes";

  definePageMeta({
    title: "よくある質問",
    description:
      "大阪公立大学合氣道部の活動頻度や新歓、稽古について、入部前によくいただく質問にお答えします。",
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

  const title = css({ textStyle: "h1" });
  const article = css({ my: "4" });
  const groupTitle = css({ textStyle: "h2", mb: "2", mt: "6" });
  const questions = css({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "4",
    p: "0",
    md: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  });
  const item = [card(), css({ listStyle: "none" })];
  const question = css({
    textStyle: "h4",
    display: "inline-flex",
    alignItems: "center",
    gap: "2",
  });
  const divider = css({ my: "2", opacity: "0.5", color: "fg.accent" });
  const answer = css({
    m: "0",
    textIndent: "em",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.base",
  });
  const textLink = link();
  const external = link({ external: true });
</script>

<template>
  <h1 :class="title" id="faq">よくある質問</h1>
  <article :class="article" aria-labelledby="faq">
    <section v-for="group in groups" :key="group.title">
      <h2 :class="groupTitle">{{ group.title }}</h2>
      <ul :class="questions">
        <li v-for="faq in group.faqs" :key="faq.question" :class="item">
          <h3 :class="question">
            <span class="i-ri:questionnaire-line" aria-hidden="true" />{{ faq.question }}
          </h3>
          <hr :class="divider" />
          <p v-for="answerText in faq.answers" :key="answerText" :class="answer">
            {{ answerText }}
          </p>
        </li>
      </ul>
    </section>
  </article>
  <p>
    まだ知りたいことがありますか？
    <NuxtLink to="/contact" :class="textLink">お問い合わせ</NuxtLink>や<a
      href="https://marshmallow-qa.com/8f2ofku54h476je"
      target="_blank"
      rel="noopener noreferrer"
      :class="external"
      >マシュマロ</a
    >からご質問下さい。
  </p>
</template>
