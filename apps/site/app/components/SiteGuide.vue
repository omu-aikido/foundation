<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { card } from "~~/styled-system/recipes";
  import IconRiArrowRightUpLine from "~icons/ri/arrow-right-up-line";

  const { navlinks } = useNavigation();
  const mainNav = computed(() => navlinks.value[0]?.children ?? []);
  const guide = css({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "3",
    guide: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  });
  const guideCard = [
    card(),
    css({
      position: "relative",
      display: "grid",
      minH: "18",
      overflow: "hidden",
      textDecoration: "none",
      translate: "auto",
      transitionProperty: "transform, border-color, background",
      transitionDuration: "180ms",
      transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
      _hover: {
        translateY: "-0.5",
        borderColor: "border.accent",
        // ダーク値のない sky-600/8 は、段階3と同じく bg.muted にする。
        bg: "bg.muted",
      },
      _motionReduce: { transitionProperty: "none" },
    }),
  ];
  const guideBody = css({ alignSelf: "center" });
  const guideTitle = css({ display: "block", fontSize: "lg", fontWeight: "bold" });
  const guideDescription = css({
    mt: "1",
    display: "block",
    flex: "1",
    fontSize: "xs",
    lineHeight: "relaxed",
    color: "fg.muted",
  });
  // アイコンを行ボックスに入れない。入れると行高の分だけ下にずれる。
  const guideArrow = css({
    position: "absolute",
    display: "flex",
    right: "4",
    top: "4",
    color: "fg.accent",
    translate: "auto",
    transitionProperty: "transform, translate, scale, rotate",
    transitionDuration: "180ms",
    transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
    _groupHover: { translateX: "0.5", translateY: "-0.5" },
    _motionReduce: { transitionProperty: "none" },
  });
</script>

<template>
  <nav aria-label="サイト案内" :class="guide">
    <NuxtLink
      v-for="item in mainNav"
      :key="item.path"
      :to="item.path"
      class="group"
      :class="guideCard"
    >
      <span :class="guideBody">
        <span :class="guideTitle">{{ item.title }}</span>
        <span v-if="item.description" :class="guideDescription">
          {{ item.description }}
        </span>
      </span>
      <span :class="guideArrow" aria-hidden="true">
        <IconRiArrowRightUpLine />
      </span>
    </NuxtLink>
  </nav>
</template>
