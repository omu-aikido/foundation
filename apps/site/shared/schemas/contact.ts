import { type ArkErrors, type } from "arktype";

const contactFieldsDefinition = {
  "+": "reject",
  name: "string",
  email: "string",
  subject: "string",
  body: "string",
} as const;

const contactFieldsType = type(contactFieldsDefinition);
export const contactType = type({
  ...contactFieldsDefinition,
  "cf-turnstile-response": "string",
});

const emailType = type("string.email");
const fieldNames = new Set(["name", "email", "subject", "body"]);

export type ContactFields = typeof contactFieldsType.infer;
type ContactInput = typeof contactType.infer;
export type ContactValidation =
  | { success: true; data: ContactInput }
  | { success: false; fields: Record<string, string[]> };
export type ContactFieldsValidation =
  | { success: true; data: ContactFields }
  | { success: false; fields: Record<string, string[]> };

function noControlCharacters(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit < 32 || codeUnit === 127) return false;
  }
  return true;
}

function addError(fields: Record<string, string[]>, key: string, message: string) {
  fields[key] ??= [];
  fields[key].push(message);
}

function arkErrorFields(errors: ArkErrors) {
  const fields: Record<string, string[]> = {};
  for (const error of errors) {
    const key = String(error.path[0] ?? "form");
    addError(
      fields,
      fieldNames.has(key) || key === "cf-turnstile-response" ? key : "form",
      "入力内容を確認してください。",
    );
  }
  return fields;
}

function normalizeFields(input: ContactFields): ContactFields {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject.trim(),
    body: input.body.trim(),
  };
}

function validateFields(data: ContactFields): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  if (!data.name) addError(fields, "name", "お名前を入力してください。");
  else if (data.name.length > 20) addError(fields, "name", "20文字以内で入力してください。");
  else if (!noControlCharacters(data.name))
    addError(fields, "name", "お名前に制御文字は使用できません。");

  if (!data.email) addError(fields, "email", "メールアドレスは必須です。");
  else if (data.email.length > 254) addError(fields, "email", "メールアドレスが長すぎます。");
  else if (emailType(data.email) instanceof type.errors)
    addError(fields, "email", "有効なメールアドレスを入力してください。");

  if (!data.subject) addError(fields, "subject", "件名を入力してください。");
  else if (data.subject.length > 50) addError(fields, "subject", "50文字以内で入力してください。");
  else if (!noControlCharacters(data.subject))
    addError(fields, "subject", "件名に改行や制御文字は使用できません。");

  if (!data.body) addError(fields, "body", "お問い合わせ内容を入力してください。");
  else if (data.body.length > 800) addError(fields, "body", "800文字以内で入力してください。");
  return fields;
}

export function validateContactFields(input: unknown): ContactFieldsValidation {
  const parsed = contactFieldsType(input);
  if (parsed instanceof type.errors) return { success: false, fields: arkErrorFields(parsed) };

  const data = normalizeFields(parsed);
  const fields = validateFields(data);
  return Object.keys(fields).length > 0 ? { success: false, fields } : { success: true, data };
}

export function validateContact(input: unknown): ContactValidation {
  const parsed = contactType(input);
  if (parsed instanceof type.errors) return { success: false, fields: arkErrorFields(parsed) };

  const fieldsData = normalizeFields(parsed);
  const data: ContactInput = {
    ...fieldsData,
    "cf-turnstile-response": parsed["cf-turnstile-response"].trim(),
  };
  const fields = validateFields(data);
  if (!data["cf-turnstile-response"])
    addError(fields, "cf-turnstile-response", "Turnstile の検証が必要です。");
  else if (data["cf-turnstile-response"].length > 2048)
    addError(fields, "cf-turnstile-response", "Turnstile token が長すぎます。");

  return Object.keys(fields).length > 0 ? { success: false, fields } : { success: true, data };
}
