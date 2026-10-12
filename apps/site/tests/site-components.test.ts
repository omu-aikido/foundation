import { expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import * as Vue from "vue";
import { validateContactFields } from "../shared/schemas/contact";
import { createRenderer, createSSRApp, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { compileScript, parse } from "vue/compiler-sfc";

async function compileComponent(name: string, globals: Record<string, unknown> = {}) {
  const filename = join(import.meta.dir, "../app/components", name);
  const source = await readFile(filename, "utf8");
  const { descriptor, errors } = parse(source, { filename });
  expect(errors).toEqual([]);
  const compiled = compileScript(descriptor, { id: name, inlineTemplate: true });
  const js = await new Bun.Transpiler({ loader: "ts", target: "bun" }).transform(compiled.content);
  const executable = js
    .replace(/^import \{([^}]+)\} from ["']vue["'];?$/gm, (_match, names: string) => {
      const bindings = names
        .split(",")
        .map((name) => name.trim().replace(/\s+as\s+/, ": "))
        .join(", ");
      return `const { ${bindings} } = vue;`;
    })
    .replace(
      /^import \{([^}]+)\} from ["']~~\/shared\/schemas\/contact["'];?$/gm,
      "const { $1 } = dependencies;",
    )
    .replace("export default", "module.exports.default =");
  const runtimeNames = Object.keys(Vue);
  const globalNames = Object.keys(globals);
  // Compile trusted local SFC output so Nuxt auto-imports can be injected into this isolated renderer.
  // oxlint-disable-next-line typescript/no-implied-eval
  const component = new Function(
    "module",
    "vue",
    "dependencies",
    ...runtimeNames,
    ...globalNames,
    `${executable}\nreturn module.exports.default;`,
  )(
    { exports: {} },
    Vue,
    { validateContactFields },
    ...runtimeNames.map((key) => (Vue as Record<string, unknown>)[key]),
    ...Object.values(globals),
  );
  return component;
}

async function renderComponent(name: string, props: Record<string, unknown> = {}) {
  return renderToString(createSSRApp(await compileComponent(name), props));
}

type HostNode = {
  tag: string;
  props: Record<string, unknown>;
  children: HostNode[];
  parent?: HostNode;
  text?: string;
};

function createHost() {
  const root: HostNode = { tag: "root", props: {}, children: [] };
  const renderer = createRenderer<HostNode, HostNode>({
    createElement: (tag) => ({ tag, props: {}, children: [] }),
    createText: (text) => ({ tag: "#text", props: {}, children: [], text }),
    createComment: (text) => ({ tag: "#comment", props: {}, children: [], text }),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.children = [];
      node.text = text;
    },
    patchProp: (node, key, _previous, next) => {
      node.props[key] = next;
    },
    insert: (node, parent, anchor) => {
      if (node.parent) {
        const oldIndex = node.parent.children.indexOf(node);
        if (oldIndex >= 0) node.parent.children.splice(oldIndex, 1);
      }
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    },
    remove: (node) => {
      if (!node.parent) return;
      const index = node.parent.children.indexOf(node);
      if (index >= 0) node.parent.children.splice(index, 1);
      node.parent = undefined;
    },
    parentNode: (node) => node.parent ?? null,
    nextSibling: (node) => {
      if (!node.parent) return null;
      return node.parent.children[node.parent.children.indexOf(node) + 1] ?? null;
    },
  });
  return { root, renderer };
}

function findNode(node: HostNode, predicate: (node: HostNode) => boolean): HostNode | undefined {
  if (predicate(node)) return node;
  for (const child of node.children) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
}

function requireNode(node: HostNode | undefined, label: string): HostNode {
  if (!node) throw new Error(`Expected ${label} node to be rendered`);
  return node;
}

it("associates FormInput errors with the matching input and textarea", async () => {
  const input = await renderComponent("FormInput.vue", {
    id: "email",
    label: "Email",
    modelValue: "",
    error: "Required",
  });
  expect(input).toContain('<label for="email"');
  expect(input).toContain('aria-invalid="true"');
  expect(input).toContain('aria-describedby="email-error"');
  expect(input).toContain('id="email-error"');

  const textarea = await renderComponent("FormInput.vue", {
    id: "message",
    label: "Message",
    modelValue: "",
    error: "Required",
    rows: 4,
  });
  expect(textarea).toContain("<textarea");
  expect(textarea).toContain('aria-describedby="message-error"');
  expect(textarea).toContain('id="message-error"');
  expect(textarea).toContain('for="message"');

  const valid = await renderComponent("FormInput.vue", {
    id: "name",
    label: "Name",
    modelValue: "Ada",
  });
  expect(valid).toContain('value="Ada"');
  expect(valid).not.toContain("aria-invalid");
  expect(valid).not.toContain("aria-describedby");
});

it("rejects an incomplete contact submit and does not call the backend without a token", async () => {
  const fetchCalls: unknown[][] = [];
  let resolveFetch: (() => void) | undefined;
  let emitToken: ((token: string) => void) | undefined;
  const backend = (...args: unknown[]) => {
    fetchCalls.push(args);
    return new Promise<void>((resolve) => (resolveFetch = resolve));
  };
  const focused: string[] = [];
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { getElementById: (id: string) => ({ focus: () => focused.push(id) }) },
  });

  const formInput = await compileComponent("FormInput.vue");
  const clientOnly = Vue.defineComponent({
    setup: (_props, context) => () => context.slots.default?.(),
  });
  const { root, renderer } = createHost();
  const app = renderer.createApp(
    await compileComponent("ContactForm.vue", {
      useRuntimeConfig: () => ({ public: { turnstileSiteKey: "test-key" } }),
      $fetch: backend,
    }),
  );
  app.component("FormInput", formInput);
  app.component("ClientOnly", clientOnly);
  app.component(
    "TurnstileWidget",
    Vue.defineComponent({
      props: ["siteKey"],
      setup: (_props, context) => {
        emitToken = (token) => {
          context.emit("token", token);
          context.emit("status", "verified");
        };
        return () => Vue.h("div");
      },
    }),
  );
  try {
    app.mount(root);
    const form = requireNode(
      findNode(root, (node) => node.tag === "form"),
      "form",
    );
    (form.props.onSubmit as (event: { preventDefault(): void }) => void)({
      preventDefault() {},
    });
    await nextTick();
    expect(findNode(root, (node) => node.props.id === "cf-name-error")).toBeDefined();
    expect(focused).toEqual(["cf-name"]);

    const values: Record<string, string> = {
      "cf-name": "Ada",
      "cf-email": "ada@example.com",
      "cf-subject": "Hello",
      "cf-body": "Message",
    };
    for (const [id, value] of Object.entries(values)) {
      const input = requireNode(
        findNode(root, (node) => node.props.id === id),
        id,
      );
      (input.props.onInput as (event: { target: { value: string } }) => void)({
        target: { value },
      });
    }
    await nextTick();
    (form.props.onSubmit as (event: { preventDefault(): void }) => void)({
      preventDefault() {},
    });
    await nextTick();
    expect(
      findNode(
        root,
        (node) => node.props.role === "alert" && Boolean(node.text?.includes("チャレンジ")),
      ),
    ).toBeDefined();
    expect(fetchCalls).toHaveLength(0);

    emitToken?.("verified-token");
    await nextTick();
    const submit = () =>
      (form.props.onSubmit as (event: { preventDefault(): void }) => void)({
        preventDefault() {},
      });
    submit();
    await nextTick();
    submit();
    expect(fetchCalls).toHaveLength(1);
    resolveFetch?.();
    await Promise.resolve();
    await nextTick();
  } finally {
    app.unmount();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
    });
  }
});

it("forwards Turnstile token and expiration events, retries by reset, and removes the widget", async () => {
  const originalWindow = globalThis.window;
  const listeners: { token: string[]; status: string[] } = { token: [], status: [] };
  const rendered: Array<{
    element: HostNode;
    options: Record<string, (...args: never[]) => void>;
  }> = [];
  const resets: string[] = [];
  const removed: string[] = [];
  const head: Array<{
    script: Array<{ src: unknown; onload: () => void; onerror: () => void }>;
  }> = [];
  const mockWindow = {
    turnstile: {
      render(element: HostNode, options: Record<string, (...args: never[]) => void>) {
        rendered.push({ element, options });
        return `widget-${rendered.length}`;
      },
      reset(id: string) {
        resets.push(id);
      },
      remove(id: string) {
        removed.push(id);
      },
    },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: mockWindow });
  const { root, renderer } = createHost();
  const widget = await compileComponent("TurnstileWidget.client.vue", {
    useHead: (entry: (typeof head)[number]) => head.push(entry),
  });
  const parent = Vue.defineComponent({
    setup: () => () =>
      Vue.h(widget, {
        siteKey: "site-key",
        onToken: (token: string) => listeners.token.push(token),
        onStatus: (status: string) => listeners.status.push(status),
      }),
  });
  const app = renderer.createApp(parent);
  try {
    app.mount(root);
    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.element.tag).toBe("div");
    (rendered[0]?.options.callback as ((token: string) => void) | undefined)?.("fresh-token");
    await nextTick();
    expect(listeners.token).toEqual(["fresh-token"]);
    expect(listeners.status.at(-1)).toBe("verified");
    rendered[0]?.options["expired-callback"]?.();
    await nextTick();
    expect(listeners.token).toEqual(["fresh-token", ""]);
    expect(listeners.status.at(-1)).toBe("expired");

    const retry = requireNode(
      findNode(root, (node) => node.tag === "button"),
      "retry button",
    );
    (retry.props.onClick as () => void)();
    await nextTick();
    expect(resets).toEqual(["widget-1"]);
    expect(rendered).toHaveLength(1);
    const callbacks = rendered[0]!.options;
    app.unmount();
    expect(removed).toEqual(["widget-1"]);
    const tokenCount = listeners.token.length;
    const statusCount = listeners.status.length;
    (callbacks.callback as ((token: string) => void) | undefined)?.("late-token");
    callbacks["expired-callback"]?.();
    callbacks["error-callback"]?.();
    callbacks["before-interactive-callback"]?.();
    expect(listeners.token).toHaveLength(tokenCount);
    expect(listeners.status).toHaveLength(statusCount);
  } finally {
    if (root.children.length) app.unmount();
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

it("recovers when the API arrives after retry exhaustion and ignores script callbacks after unmount", async () => {
  const originalWindow = globalThis.window;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const queue: Array<{ id: number; callback: () => void }> = [];
  const cleared: number[] = [];
  const emitted: string[] = [];
  const rendered: Array<{ options: Record<string, (...args: never[]) => void> }> = [];
  const mockWindow: {
    turnstile?: {
      render: (_node: HostNode, options: Record<string, (...args: never[]) => void>) => string;
      reset: () => void;
      remove: () => void;
    };
  } = {};
  let id = 0;
  Object.defineProperty(globalThis, "window", { configurable: true, value: mockWindow });
  globalThis.setTimeout = ((callback: () => void) => {
    const timer = ++id;
    queue.push({ id: timer, callback });
    return timer as unknown as ReturnType<typeof setTimeout>;
  }) as unknown as typeof setTimeout;
  globalThis.clearTimeout = ((timer: ReturnType<typeof setTimeout>) => {
    if (typeof timer === "number") cleared.push(timer);
  }) as typeof clearTimeout;
  const { root, renderer } = createHost();
  const head: Array<{
    script: Array<{ src: Vue.Ref<string>; onload: () => void; onerror: () => void }>;
  }> = [];
  const widget = await compileComponent("TurnstileWidget.client.vue", {
    useHead: (entry: (typeof head)[number]) => head.push(entry),
  });
  const parent = Vue.defineComponent({
    setup: () => () =>
      Vue.h(widget, {
        siteKey: "site-key",
        onToken: (token: string) => emitted.push(`token:${token}`),
        onStatus: (status: string) => emitted.push(`status:${status}`),
      }),
  });
  const app = renderer.createApp(parent);
  try {
    app.mount(root);
    const script = head[0]?.script[0];
    expect(script).toBeDefined();
    for (let attempt = 0; attempt < 21; attempt += 1) queue.shift()?.callback();
    await nextTick();
    expect(findNode(root, (node) => node.text?.includes("確認に失敗") ?? false)).toBeDefined();
    expect(queue).toHaveLength(0);
    mockWindow.turnstile = {
      render(_node, options) {
        rendered.push({ options });
        return "late-widget";
      },
      reset() {},
      remove() {},
    };
    script?.onload();
    await nextTick();
    expect(rendered).toHaveLength(1);
    expect(findNode(root, (node) => node.text?.includes("確認に失敗") ?? false)).toBeUndefined();
    (rendered[0]?.options.callback as ((token: string) => void) | undefined)?.("late-token");
    await nextTick();
    expect(findNode(root, (node) => node.text?.includes("確認完了") ?? false)).toBeDefined();
    script?.onload();
    expect(rendered).toHaveLength(1);
    expect(findNode(root, (node) => node.text?.includes("確認完了") ?? false)).toBeDefined();

    app.unmount();
    const emittedAfterUnmount = emitted.length;
    const pendingAfterUnmount = queue.length;
    script?.onload();
    script?.onerror();
    await nextTick();
    expect(rendered).toHaveLength(1);
    expect(queue).toHaveLength(pendingAfterUnmount);
    expect(emitted).toHaveLength(emittedAfterUnmount);
  } finally {
    if (root.children.length) app.unmount();
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

it("recovers from a script error with a new script URL and renders once when the API arrives", async () => {
  const originalWindow = globalThis.window;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const queue: Array<{ id: number; callback: () => void }> = [];
  let timerId = 0;
  const rendered: Array<{ options: Record<string, (...args: never[]) => void> }> = [];
  const mockWindow: {
    turnstile?: {
      render: (_node: HostNode, options: Record<string, (...args: never[]) => void>) => string;
      reset: () => void;
      remove: () => void;
    };
  } = {};
  Object.defineProperty(globalThis, "window", { configurable: true, value: mockWindow });
  globalThis.setTimeout = ((callback: () => void) => {
    const id = ++timerId;
    queue.push({ id, callback });
    return id as unknown as ReturnType<typeof setTimeout>;
  }) as unknown as typeof setTimeout;
  globalThis.clearTimeout = (() => {}) as typeof clearTimeout;
  const head: Array<{
    script: Array<{ src: Vue.Ref<string>; onload: () => void; onerror: () => void }>;
  }> = [];
  const { root, renderer } = createHost();
  const widget = await compileComponent("TurnstileWidget.client.vue", {
    useHead: (entry: (typeof head)[number]) => head.push(entry),
  });
  const app = renderer.createApp(widget, { siteKey: "site-key" });
  try {
    app.mount(root);
    const script = head[0]?.script[0];
    expect(script).toBeDefined();
    script?.onerror();
    await nextTick();
    expect(findNode(root, (node) => Boolean(node.text?.includes("確認に失敗")))).toBeDefined();

    const retry = requireNode(
      findNode(root, (node) => node.tag === "button"),
      "retry button",
    );
    (retry.props.onClick as () => void)();
    await nextTick();
    expect(script?.src.value).toContain("&retry=");
    expect(findNode(root, (node) => node.text?.includes("確認に失敗") ?? false)).toBeUndefined();

    mockWindow.turnstile = {
      render(_node, options) {
        rendered.push({ options });
        return "recovered-widget";
      },
      reset() {},
      remove() {},
    };
    script?.onload();
    await nextTick();
    expect(rendered).toHaveLength(1);
    script?.onload();
    expect(rendered).toHaveLength(1);
    expect(findNode(root, (node) => Boolean(node.text?.includes("確認に失敗")))).toBeUndefined();
  } finally {
    app.unmount();
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

it("mounts on the first slideshow image, navigates on click, and starts no interval", async () => {
  const originalSetInterval = globalThis.setInterval;
  const intervals: unknown[] = [];
  globalThis.setInterval = ((...args: unknown[]) => {
    intervals.push(args);
    return 0 as unknown as ReturnType<typeof setInterval>;
  }) as unknown as typeof setInterval;
  const { root, renderer } = createHost();
  const app = renderer.createApp(await compileComponent("HomeSlideshow.vue"));
  try {
    app.mount(root);
    const first = findNode(
      root,
      (node) => node.tag === "img" && node.props.alt === "2025年度集合写真",
    );
    expect(first).toBeDefined();
    expect((first?.parent?.parent?.props.class as string) ?? "").toContain("opacity-100");
    expect(intervals).toHaveLength(0);

    const next = requireNode(
      findNode(root, (node) => node.tag === "button" && node.props["aria-label"] === "次の写真"),
      "next-photo button",
    );
    (next.props.onClick as () => void)();
    await nextTick();
    const second = findNode(
      root,
      (node) => node.tag === "img" && node.props.alt === "2026年度の新歓の様子です",
    );
    expect(second).toBeDefined();
    expect((second?.parent?.parent?.props.class as string) ?? "").toContain("opacity-100");
    expect(intervals).toHaveLength(0);
  } finally {
    app.unmount();
    globalThis.setInterval = originalSetInterval;
  }
});
