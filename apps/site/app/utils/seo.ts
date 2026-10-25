export function createSeoMeta(
  page: { path: string; title?: string; description?: string },
  siteName: string,
  image: string,
) {
  const title = page.path === "/" || !page.title ? siteName : `${page.title} | ${siteName}`;
  const description = page.description ?? "";

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogSiteName: siteName,
    ogUrl: `https://omu-aikido.com${page.path === "/" ? "" : page.path}`,
    ogType: "website" as const,
    ogImage: image,
    ogImageWidth: "1024",
    ogImageHeight: "575",
    ogImageAlt: `${siteName}の稽古風景`,
    ogLocale: "ja_JP",
    twitterCard: "summary_large_image" as const,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  };
}
