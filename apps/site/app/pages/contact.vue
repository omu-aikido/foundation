<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { link } from "~~/styled-system/recipes";

  definePageMeta({
    title: "お問い合わせ",
    description:
      "大阪公立大学合氣道部へのお問い合わせはこちら。見学・体験・入部に関する質問を受け付けています。",
    navigation: { parent: "/", order: 4 },
  });

  const page = css({ mb: "4" });
  const title = css({ textStyle: "h1" });
  const lead = css({ my: "2", color: "fg.base" });
  const notice = css({ fontSize: "sm", lineHeight: "sm" });
  const external = link({ external: true });
  const followup = css({ mt: "2", fontSize: "base", lineHeight: "normal", color: "fg.base" });
  const textLink = link();
</script>

<template>
  <section :class="page">
    <h1 :class="title">お問い合わせ</h1>
    <p :class="lead">見学・体験・入部に関するご質問など、お気軽にご連絡ください。</p>
    <p :class="notice">
      ※このフォームを送信することで、<NuxtLink
        to="/terms-of-service"
        target="_blank"
        :class="external"
        >利用規約</NuxtLink
      >及び<NuxtLink to="/privacy-policy" target="_blank" :class="external"
        >プライバシーポリシー</NuxtLink
      >に同意したものとなります。
    </p>
    <ContactForm />
    <p :class="followup">
      <a
        href="https://marshmallow-qa.com/8f2ofku54h476je"
        target="_blank"
        rel="noopener noreferrer"
        :class="external"
        >マシュマロ</a
      >では匿名質問も受け付けています。よくある質問は<NuxtLink to="/faq" :class="textLink"
        >こちら</NuxtLink
      >から。
    </p>
  </section>
</template>
