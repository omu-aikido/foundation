<script setup lang="ts">
  const images = [
    { src: "/images/hero/a899c25a.jpg", alt: "2025年度集合写真" },
    { src: "/images/hero/a61baa65.jpg", alt: "2026年度の新歓の様子です" },
    { src: "/images/hero/a2007d4a.jpg", alt: "普段の稽古の様子1" },
    { src: "/images/hero/bea041cf.png", alt: "普段の稽古の様子2" },
  ];
  const current = ref(0);

  function show(index: number) {
    current.value = (index + images.length) % images.length;
  }
</script>

<template>
  <div
    class="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-xl"
  >
    <div
      v-for="(image, index) in images"
      :key="image.src"
      class="absolute inset-0 h-full w-full motion-safe:transition-opacity motion-safe:duration-1000"
      :class="index === current ? 'z-10 opacity-100' : 'opacity-0'"
    >
      <img
        :src="image.src"
        alt=""
        class="absolute inset-0 h-full w-full scale-110 object-cover blur-sm contrast-125"
        loading="lazy"
      />
      <div class="relative flex h-full w-full items-center justify-center">
        <img
          :src="image.src"
          :alt="image.alt"
          class="relative z-10 max-h-full max-w-full object-contain"
          :loading="index === 0 ? 'eager' : 'lazy'"
        />
      </div>
    </div>
    <div
      class="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/30 via-transparent to-black/10"
    />
    <button
      type="button"
      class="absolute left-4 top-1/2 z-30 rounded-full bg-black/30 p-3 text-white opacity-100 transition motion-reduce:transition-none"
      aria-label="前の写真"
      @click="show(current - 1)"
    >
      <span class="i-ri:arrow-left-s-line block size-6" />
    </button>
    <button
      type="button"
      class="absolute right-4 top-1/2 z-30 rounded-full bg-black/30 p-3 text-white opacity-100 transition motion-reduce:transition-none"
      aria-label="次の写真"
      @click="show(current + 1)"
    >
      <span class="i-ri:arrow-right-s-line block size-6" />
    </button>
    <div class="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3">
      <button
        v-for="(_, index) in images"
        :key="index"
        type="button"
        class="h-1.5 rounded-full bg-white motion-safe:transition-[width,opacity]"
        :class="index === current ? 'w-8' : 'w-2 opacity-40'"
        :aria-label="`${index + 1}枚目の写真`"
        @click="show(index)"
      />
    </div>
  </div>
</template>
