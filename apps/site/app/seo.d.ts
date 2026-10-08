declare module "nuxt/app" {
  interface PageMeta {
    title?: string;
    description?: string;
    navigation?: {
      parent?: string;
      order: number;
    };
  }
}

export {};
