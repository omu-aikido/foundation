<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { container } from "~~/styled-system/patterns";
  import { link } from "~~/styled-system/recipes";
  import IconRiGithubFill from "~icons/ri/github-fill";
  import IconRiInstagramFill from "~icons/ri/instagram-fill";
  import IconRiTwitterFill from "~icons/ri/twitter-fill";

  const footer = [
    container(),
    css({
      my: "6",
      textAlign: "center",
      fontSize: "sm",
      lineHeight: "sm",
      color: "fg.muted",
      _print: { display: "none" },
    }),
  ];
  const copy = css({ lineHeight: "relaxed" });
  const addressBreak = css({ sm: { display: "none" } });
  const legal = css({ mt: "3" });
  const legalLink = [link(), css({ mx: "4" })];
  const socials = css({
    mx: "auto",
    mt: "8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "1/4",
    fontSize: "2xl",
    lineHeight: "2xl",
    sm: { px: "1/3" },
  });
  // アイコンを行ボックスに入れない。入れると 2xl の行高で 8px 伸びる。
  const social = css({
    display: "flex",
    transitionProperty: "color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    _hover: { color: "fg.accent" },
  });
</script>

<template>
  <footer :class="footer">
    <p :class="copy">
      <span>&copy; omu-aikido.com All Rights Reserved.</span><br />
      <span>
        〒599-8531 大阪府堺市中区学園町1番1号<br :class="addressBreak" />
        大阪公立大学合氣道部
      </span>
    </p>
    <p :class="legal">
      <NuxtLink to="/privacy-policy" :class="legalLink">プライバシーポリシー</NuxtLink>
      <NuxtLink to="/terms-of-service" :class="legalLink">利用規約</NuxtLink>
      <NuxtLink to="/licenses.txt" :class="legalLink">OSSライセンス</NuxtLink>
    </p>
    <div :class="socials">
      <a
        href="https://twitter.com/fudaiaiki"
        aria-label="旧府大合氣道部 Twitter"
        :class="social"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconRiTwitterFill />
      </a>
      <a
        href="https://instagram.com/hamudaiaikidoubu"
        aria-label="Instagram"
        :class="social"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconRiInstagramFill />
      </a>
      <a
        href="https://github.com/omu-aikido"
        aria-label="GitHub"
        :class="social"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconRiGithubFill />
      </a>
    </div>
  </footer>
</template>
