import { describe, expect, it } from "bun:test";
import { createSeoMeta } from "../app/utils/seo";

const siteName = "大阪公立大学合氣道部";
const image = "https://omu-aikido.com/images/hero/bea041cf.png";

describe("createSeoMeta", () => {
  it("uses the club name as the home title and keeps the canonical URL at the origin", () => {
    const meta = createSeoMeta(
      {
        path: "/",
        title: "トップ",
        description: "大阪公立大学合氣道部の活動案内です。",
      },
      siteName,
      image,
    );

    expect(meta.title).toBe(siteName);
    expect(meta.ogUrl).toBe("https://omu-aikido.com");
    expect(meta.description).toBe("大阪公立大学合氣道部の活動案内です。");
  });

  it("shares the page title and description across Open Graph and X metadata", () => {
    const meta = createSeoMeta(
      {
        path: "/about",
        title: "活動紹介",
        description: "活動日と稽古場所をご案内します。",
      },
      siteName,
      image,
    );

    expect(meta.title).toBe(`活動紹介 | ${siteName}`);
    expect(meta.description).toBe("活動日と稽古場所をご案内します。");
    expect(meta.ogTitle).toBe(meta.title);
    expect(meta.ogDescription).toBe(meta.description);
    expect(meta.ogUrl).toBe("https://omu-aikido.com/about");
    expect(meta.ogSiteName).toBe(siteName);
    expect(meta.ogType).toBe("website");
    expect(meta.ogImage).toBe(image);
    expect(meta.ogImageWidth).toBe("1024");
    expect(meta.ogImageHeight).toBe("575");
    expect(meta.ogImageAlt).toBe(`${siteName}の稽古風景`);
    expect(meta.ogLocale).toBe("ja_JP");
    expect(meta.twitterCard).toBe("summary_large_image");
    expect(meta.twitterTitle).toBe(meta.title);
    expect(meta.twitterDescription).toBe(meta.description);
    expect(meta.twitterImage).toBe(image);
  });

  it("falls back to the site name and an empty description for pages without metadata", () => {
    const meta = createSeoMeta({ path: "/other" }, siteName, image);

    expect(meta.title).toBe(siteName);
    expect(meta.description).toBe("");
    expect(meta.ogUrl).toBe("https://omu-aikido.com/other");
  });
});
