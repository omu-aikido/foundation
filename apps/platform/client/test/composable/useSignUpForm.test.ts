import { ref } from "vue";
import { describe, expect, mock, test } from "bun:test";

const create = mock(async () => undefined);
const prepareEmailAddressVerification = mock(async () => undefined);
const clerk = ref({
  loaded: true,
  client: {
    signUp: {
      create,
      prepareEmailAddressVerification,
    },
  },
});

await mock.module("@clerk/vue", () => ({
  useClerk: () => clerk,
}));

const { useSignUpForm } = await import("../../src/composable/useSignUpForm");

describe("useSignUpForm", () => {
  test("starts signup when Clerk is loaded", async () => {
    const form = useSignUpForm(2026);
    form.setFormValue("email", "member@example.com");
    form.setFormValue("newPassword", "long-password");
    form.setFormValue("firstName", "太郎");
    form.setFormValue("lastName", "山田");
    form.setFormValue("birthday", "2000-01-01");
    form.setFormValue("legalAccepted", true);

    const result = await form.handleClerkSignUp();

    expect(result).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
    expect(prepareEmailAddressVerification).toHaveBeenCalledTimes(1);
  });

  test("accepts a basic step with email and one long enough password", () => {
    const form = useSignUpForm(2026);
    form.setFormValue("email", "member@example.com");
    form.setFormValue("newPassword", "long-password");

    expect(form.validateStep("basic")).toBe(true);
  });

  test("rejects a password outside 10 to 100 characters", () => {
    const form = useSignUpForm(2026);
    form.setFormValue("email", "member@example.com");
    form.setFormValue("newPassword", "123456789");

    expect(form.validateStep("basic")).toBe(false);
    expect(form.formErrors.newPassword).toBeDefined();

    form.setFormValue("newPassword", "a".repeat(101));

    expect(form.validateStep("basic")).toBe(false);
    expect(form.formErrors.newPassword).toBeDefined();
  });

  test("rejects an empty required joined year before signup", () => {
    const form = useSignUpForm(2026);
    form.setFormValue("joinedAt", null);

    const result = form.validateStep("profile");

    expect(result).toBe(false);
    expect(form.formErrors.joinedAt).toBeDefined();
  });
});
