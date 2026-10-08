<template>
  <article
    aria-label="Article content"
    class="container prose dark:prose-invert prose-p:(m-0) prose-ul:(m-0 list-none p-0) prose-li:(before:content-['◆'] before:mr-2 before:fg-muted) prose-a:(underline underline-offset-4 underline-sky-600 dark:underline-sky-500)"
  >
    <slot />
  </article>
</template>
