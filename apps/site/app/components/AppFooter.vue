<template>
  <footer class="container my-6 text-center text-sm fg-muted print:hidden">
    <p class="leading-relaxed">
      <span>&copy; omu-aikido.com All Rights Reserved.</span><br />
      <span>
        〒599-8531 大阪府堺市中区学園町1番1号<br class="sm:hidden" />
        大阪公立大学合氣道部
      </span>
    </p>
    <p class="mt-3">
      <NuxtLink to="/privacy-policy" class="link mx-4">プライバシーポリシー</NuxtLink>
      <NuxtLink to="/terms-of-service" class="link mx-4">利用規約</NuxtLink>
      <NuxtLink to="/licenses.txt" class="link mx-4">OSSライセンス</NuxtLink>
    </p>
    <div class="mx-auto mt-8 flex items-center justify-between px-1/4 text-2xl sm:px-1/3">
      <a
        href="https://twitter.com/fudaiaiki"
        aria-label="旧府大合氣道部 Twitter"
        class="i-ri:twitter-fill transition hover:fg-accent"
        target="_blank"
        rel="noopener noreferrer"
      />
      <a
        href="https://instagram.com/hamudaiaikidoubu"
        aria-label="Instagram"
        class="i-ri:instagram-fill transition hover:fg-accent"
        target="_blank"
        rel="noopener noreferrer"
      />
      <a
        href="https://github.com/omu-aikido"
        aria-label="GitHub"
        class="i-ri:github-fill transition hover:fg-accent"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  </footer>
</template>
