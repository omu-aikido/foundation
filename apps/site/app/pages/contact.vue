<script setup lang="ts">
  definePageMeta({
    title: "お問い合わせ",
    description: "ご質問などはこちらから",
    navigation: { parent: "/", order: 4 },
  });
</script>

<template>
  <section class="mb-4">
    <h1 class="h1">お問い合わせ</h1>
    <p class="my-2 fg-base">見学・体験・入部に関するご質問など、お気軽にご連絡ください。</p>
    <p class="text-sm">
      ※このフォームを送信することで、<NuxtLink
        to="/terms-of-service"
        target="_blank"
        class="outer_link"
        >利用規約</NuxtLink
      >及び<NuxtLink to="/privacy-policy" target="_blank" class="outer_link"
        >プライバシーポリシー</NuxtLink
      >に同意したものとなります。
    </p>
    <ContactForm />
    <p class="mt-2 text-base fg-base">
      <a
        href="https://marshmallow-qa.com/8f2ofku54h476je"
        target="_blank"
        rel="noopener noreferrer"
        class="outer_link"
        >マシュマロ</a
      >では匿名質問も受け付けています。よくある質問は<NuxtLink to="/faq" class="link"
        >こちら</NuxtLink
      >から。
    </p>
  </section>
</template>
