<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { button } from "~~/styled-system/recipes";
  import IconRiArrowLeftSLine from "~icons/ri/arrow-left-s-line";
  import IconRiArrowRightSLine from "~icons/ri/arrow-right-s-line";

  const images = [
    { src: "/images/hero/a899c25a.webp", alt: "2025年度集合写真", width: 1280, height: 696 },
    {
      src: "/images/hero/a61baa65.webp",
      alt: "2026年度の新歓の様子です",
      width: 1080,
      height: 811,
    },
    { src: "/images/hero/a2007d4a.webp", alt: "普段の稽古の様子1", width: 1280, height: 960 },
    { src: "/images/hero/bea041cf.webp", alt: "普段の稽古の様子2", width: 1024, height: 575 },
  ];
  const current = ref(0);

  function show(index: number) {
    current.value = (index + images.length) % images.length;
  }

  const frame = css({
    position: "relative",
    display: "block",
    aspectRatio: "video",
    w: "full",
    overflow: "hidden",
    rounded: "2xl",
    bg: "overlay.frame",
    shadow: "xl",
  });
  const slide = {
    position: "absolute",
    inset: "0",
    h: "full",
    w: "full",
    _motionSafe: {
      transitionProperty: "opacity",
      transitionDuration: "1000ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  } as const;
  const slideOn = css({ ...slide, zIndex: "10", opacity: "1" });
  const slideOff = css({ ...slide, opacity: "0" });
  const wash = css({
    position: "absolute",
    inset: "0",
    h: "full",
    w: "full",
    objectFit: "cover",
    filter: "auto",
    blur: "sm",
    contrast: "125%",
    scale: "auto",
    scaleX: "110%",
    scaleY: "110%",
  });
  const stage = css({
    position: "relative",
    display: "flex",
    h: "full",
    w: "full",
    alignItems: "center",
    justifyContent: "center",
  });
  const photo = css({
    position: "relative",
    zIndex: "10",
    maxH: "full",
    maxW: "full",
    objectFit: "contain",
  });
  const scrim = css({
    pointerEvents: "none",
    position: "absolute",
    inset: "0",
    zIndex: "20",
    backgroundGradient: "photoScrim",
  });
  const navButton = {
    position: "absolute",
    top: "1/2",
    zIndex: "30",
    rounded: "full",
    bg: "overlay.scrim",
    p: "3",
    color: "overlay.fg",
  } as const;
  const prevButton = [button(), css({ ...navButton, left: "4" })];
  const nextButton = [button(), css({ ...navButton, right: "4" })];
  const navIcon = css({
    display: "block",
    w: "6",
    h: "6",
    fontSize: "2xl",
    lineHeight: "none",
  });
  const dots = css({
    position: "absolute",
    bottom: "4",
    left: "1/2",
    zIndex: "30",
    display: "flex",
    translate: "auto",
    translateX: "-1/2",
    gap: "1",
  });
  const dotButton = [button(), css({ p: "2.5" })];
  const dot = {
    display: "block",
    h: "1.5",
    rounded: "full",
    bg: "overlay.fg",
    _motionSafe: {
      transitionProperty: "width, opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  } as const;
  const dotOn = css({ ...dot, w: "8" });
  const dotOff = css({ ...dot, w: "2", opacity: "0.4" });
</script>

<template>
  <div :class="frame">
    <div
      v-for="(image, index) in images"
      :key="image.src"
      :class="index === current ? slideOn : slideOff"
    >
      <img :src="image.src" alt="" :class="wash" loading="lazy" />
      <div :class="stage">
        <img
          :src="image.src"
          :alt="image.alt"
          :width="image.width"
          :height="image.height"
          :class="photo"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : undefined"
        />
      </div>
    </div>
    <div :class="scrim" />
    <button type="button" :class="prevButton" aria-label="前の写真" @click="show(current - 1)">
      <span :class="navIcon"><IconRiArrowLeftSLine /></span>
    </button>
    <button type="button" :class="nextButton" aria-label="次の写真" @click="show(current + 1)">
      <span :class="navIcon"><IconRiArrowRightSLine /></span>
    </button>
    <div :class="dots">
      <button
        v-for="(_, index) in images"
        :key="index"
        type="button"
        :class="dotButton"
        :aria-label="`${index + 1}枚目の写真`"
        :aria-current="index === current ? 'true' : undefined"
        @click="show(index)"
      >
        <span :class="index === current ? dotOn : dotOff" />
      </button>
    </div>
  </div>
</template>
