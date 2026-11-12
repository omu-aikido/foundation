<script setup lang="ts">
  import { computed } from "vue";
  import { RouterLink, useRoute } from "vue-router";

  const route = useRoute();
  const current = computed(() => {
    if (route.path.startsWith("/admin/users/")) return "/admin/accounts";
    if (route.path === "/admin" || route.path === "/admin/accounts") return route.path;
    return "/admin";
  });

  function page(path: string) {
    return current.value === path ? "page" : undefined;
  }
</script>

<template>
  <h1 class="text-2xl font-bold mb-2 text">管理メニュー</h1>
  <!-- ページ遷移なのでタブにしない。タブだと矢印キーが履歴移動に見える。 -->
  <nav class="flex gap-1 border-b border-overlay1" aria-label="管理メニュー">
    <RouterLink
      to="/admin"
      class="px-4 py-2.5 text-sm font-medium bg-transparent border-b-2 no-underline transition-colors hover:text-blue-500"
      :class="page('/admin') ? 'border-blue-500 text-blue-500' : 'border-transparent text-subtext'"
      :aria-current="page('/admin')"
    >
      トップ
    </RouterLink>
    <RouterLink
      to="/admin/accounts"
      class="px-4 py-2.5 text-sm font-medium bg-transparent border-b-2 no-underline transition-colors hover:text-blue-500"
      :class="
        page('/admin/accounts')
          ? 'border-blue-500 text-blue-500'
          : 'border-transparent text-subtext'
      "
      :aria-current="page('/admin/accounts')"
    >
      アカウント
    </RouterLink>
  </nav>
</template>
