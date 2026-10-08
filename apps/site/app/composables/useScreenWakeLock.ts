export function useScreenWakeLock(active: Readonly<Ref<boolean>>) {
  let sentinel: WakeLockSentinel | undefined;
  let requestVersion = 0;

  async function acquire() {
    if (
      !import.meta.client ||
      !active.value ||
      document.visibilityState !== "visible" ||
      sentinel ||
      !("wakeLock" in navigator)
    ) {
      return;
    }

    const version = ++requestVersion;

    try {
      const requested = await navigator.wakeLock.request("screen");

      // request中に停止・画面遷移した場合は、取得直後に解放する。
      if (version !== requestVersion || !active.value) {
        await requested.release();
        return;
      }

      sentinel = requested;
      requested.addEventListener(
        "release",
        () => {
          if (sentinel === requested) sentinel = undefined;
        },
        { once: true },
      );
    } catch {
      // 非対応端末や省電力モードなど、端末側が拒否した場合は通常動作を続ける。
    }
  }

  async function release() {
    requestVersion += 1;
    const current = sentinel;
    sentinel = undefined;

    if (!current) return;

    try {
      await current.release();
    } catch {
      // 端末側ですでに解放済みなら追加対応は不要。
    }
  }

  function syncWithPageState() {
    if (active.value && document.visibilityState === "visible") {
      void acquire();
    } else {
      void release();
    }
  }

  watch(active, syncWithPageState, { flush: "sync" });

  onMounted(() => {
    document.addEventListener("visibilitychange", syncWithPageState);
    syncWithPageState();
  });

  onBeforeUnmount(() => {
    document.removeEventListener("visibilitychange", syncWithPageState);
    void release();
  });
}
