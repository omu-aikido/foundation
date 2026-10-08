import { describe, expect, it } from "bun:test";

import { validateContact, validateContactFields } from "../shared/schemas/contact";

const fields = {
  name: " 山田 太郎 ",
  email: " taro@example.com ",
  subject: " 見学について ",
  body: " 見学を希望します。 ",
};

describe("contact ArkType validator", () => {
  it("文字列の object 以外と未知フィールドを strict に拒否する", () => {
    expect(validateContactFields({ ...fields, extra: "x" }).success).toBe(false);
    expect(validateContactFields({ ...fields, name: 1 }).success).toBe(false);
  });

  it("入力を trim し、既存の各制約メッセージを維持する", () => {
    const valid = validateContactFields(fields);
    expect(valid).toMatchObject({
      success: true,
      data: {
        name: "山田 太郎",
        email: "taro@example.com",
        subject: "見学について",
        body: "見学を希望します。",
      },
    });

    expect(validateContactFields({ ...fields, name: "\n" })).toMatchObject({
      success: false,
      fields: { name: ["お名前を入力してください。"] },
    });
    expect(validateContactFields({ ...fields, subject: "件名\nBcc: test" })).toMatchObject({
      success: false,
      fields: { subject: ["件名に改行や制御文字は使用できません。"] },
    });
    expect(validateContactFields({ ...fields, email: "not-an-email" })).toMatchObject({
      success: false,
      fields: { email: ["有効なメールアドレスを入力してください。"] },
    });
  });

  it("Turnstile token の必須・最大長もサーバー側で検証する", () => {
    expect(validateContact({ ...fields, "cf-turnstile-response": " " })).toMatchObject({
      success: false,
      fields: { "cf-turnstile-response": ["Turnstile の検証が必要です。"] },
    });
    expect(
      validateContact({
        ...fields,
        "cf-turnstile-response": "t".repeat(2049),
      }),
    ).toMatchObject({
      success: false,
      fields: { "cf-turnstile-response": ["Turnstile token が長すぎます。"] },
    });
  });
});
