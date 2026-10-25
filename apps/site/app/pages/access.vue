<script setup lang="ts">
  definePageMeta({
    title: "稽古場所",
    description:
      "大阪公立大学合氣道部の稽古場所を、森之宮・中百舌鳥・杉本のキャンパス別に案内します。",
    navigation: { parent: "/", order: 2 },
  });
  const maps = {
    nakamozu:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d397.3430397985925!2d135.5079877652318!3d34.54625048292778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000dbcc4b8d0ddd%3A0x74010ebd35722f16!2z44CSNTk5LTgyMzEg5aSn6Ziq5bqc5aC65biC5Lit5Yy65a2m5ZyS55S677yRIEMy5qOfICjkvZPogrLppKgp!5e0!3m2!1sja!2sjp!4v1735826369857!5m2!1sja!2sjp",
    sugimoto:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d205.279790893043!2d135.50839328817298!3d34.5921065795498!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000dc1300eaceed%3A0xaadb891609ab1fc4!2z44CSNTU4LTAwMjIg5aSn6Ziq5bqc5aSn6Ziq5biC5L2P5ZCJ5Yy65p2J5pys77yT5LiB55uu77yT4oiS77yR77yT77yYIOaWsOatpumBk-WgtA!5e0!3m2!1sja!2sjp!4v1735826406691!5m2!1sja!2sjp",
  };
</script>

<template>
  <MarkdownPage>
    <h1>稽古場所</h1>
    <h2>森之宮キャンパス</h2>
    <p>2026年度より2階マルチユースルーム（201号室）または1階サブアリーナにて活動しています。</p>
    <img
      src="/images/access/multi-use-room.png"
      alt="マルチユースルームの場所は2階の北側にあります。"
      loading="eager"
    />
    <h2>中百舌鳥キャンパス</h2>
    <p>中百舌鳥門または白鷺門より入って左手、C2棟（体育館）1階奥の武道場で活動しています。</p>
    <EmbedFrame :src="maps.nakamozu" title="中百舌鳥キャンパス" />
    <h2>杉本キャンパス</h2>
    <p>旧教養地区南東に位置する新武道場の西側で活動しています。</p>
    <EmbedFrame :src="maps.sugimoto" title="杉本キャンパス" />
  </MarkdownPage>
</template>
