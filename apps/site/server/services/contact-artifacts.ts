import type { ContactFields } from "../../shared/schemas/contact";

export function buildContactArtifacts(input: {
  uid: string;
  masked: boolean;
  data: ContactFields;
}) {
  const gmailUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(`subject:"[${input.uid}]"`)}`;
  return {
    email: {
      subject: `${input.data.subject} [${input.uid}]`,
      text: `お名前: ${input.data.name}\nメアド: ${input.data.email}\n件名: ${input.data.subject}\n\n${input.data.body}`,
    },
    discordPayload: {
      thread_name: input.data.subject,
      embeds: [
        {
          title: `問い合わせ [${input.uid}]`,
          color: input.masked ? 0xed4245 : 0x5865f2,
          fields: [
            {
              name: "お名前",
              value: input.masked ? "********" : input.data.name,
              inline: true,
            },
            {
              name: "メールアドレス",
              value: input.masked ? "********" : input.data.email,
              inline: true,
            },
            { name: "メール", value: gmailUrl, inline: false },
            {
              name: "お問い合わせ内容",
              value: input.masked ? "⚠️ メールを参照" : input.data.body,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}
