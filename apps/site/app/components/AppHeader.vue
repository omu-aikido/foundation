<script setup lang="ts">
  import { css } from "~~/styled-system/css";

  const header = css({
    position: "sticky",
    top: "0",
    zIndex: "100",
    w: "full",
    backdropFilter: "auto",
    backdropBlur: "3xl",
    _print: { display: "none" },
  });
  const bar = css({
    mx: "auto",
    display: "flex",
    maxW: "5xl",
    alignItems: "center",
    justifyContent: "space-between",
    px: "4",
    py: "3",
  });
  const logoLink = css({ rounded: "full" });
  const logo = css({
    h: "10",
    w: "10",
    rounded: "full",
    p: "1",
    // `group` は印だけ。reduced motion のときは回転させない。
    _motionSafe: { _groupHover: { animation: "spin" } },
  });
</script>

<template>
  <header :class="header">
    <div :class="bar">
      <NuxtLink to="/" aria-label="トップへ" class="group" :class="logoLink">
        <img src="/favicon.svg" alt="" width="40" height="40" :class="logo" />
      </NuxtLink>
    </div>
  </header>
</template>
