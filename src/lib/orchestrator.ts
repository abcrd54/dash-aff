import { generateMailbox, checkMessages, getMessageDetail } from "./kumail";
import { signup, getToken, getUserMe, setupProfile, createApiKey } from "./bunsocial";
import { createAffiliateAccount, updateAffiliateAccount } from "./db";

interface OnboardingData {
  user_id: number;
  name: string;
  email_domain: string;
  password: string;
  first_name: string;
  last_name: string;
  org_name: string;
  timezone: string;
}

export async function* runOnboarding(data: OnboardingData): AsyncGenerator<{ step: string; status: string; detail?: string }> {
  let accountId: number | null = null;
  const passwordHash = Bun.password.hash(data.password, "bcrypt");

  try {
    // Step 1: Generate email
    yield { step: "generate_email", status: "running", detail: "Generating disposable email..." };
    const email = await generateMailbox([data.email_domain]);
    yield { step: "generate_email", status: "done", detail: email };

    // Create account in DB
    const account = createAffiliateAccount({
      user_id: data.user_id,
      name: data.name,
      email,
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      org_name: data.org_name,
      timezone: data.timezone,
    });
    accountId = account.id;
    updateAffiliateAccount(accountId, { status: "email_created" });

    // Step 2: Signup
    yield { step: "signup", status: "running", detail: "Registering account..." };
    await signup(email, data.password);
    yield { step: "signup", status: "done", detail: "Account registered" };
    updateAffiliateAccount(accountId, { status: "signed_up" });

    // Step 3-6: Poll inbox for verification email
    yield { step: "poll_inbox", status: "running", detail: "Waiting for verification email..." };
    updateAffiliateAccount(accountId, { status: "waiting_email" });

    let verifyUrl: string | null = null;
    for (let attempt = 1; attempt <= 12; attempt++) {
      yield {
        step: "poll_inbox",
        status: "running",
        detail: `Checking inbox... (attempt ${attempt}/12)`,
      };

      const messages = await checkMessages(email);
      for (const msg of messages) {
        if (msg.subject.toLowerCase().includes("confirm") || msg.subject.toLowerCase().includes("verify")) {
          const detail = await getMessageDetail(email, msg.id);
          const match = detail.html.match(/https?:\/\/[^\s"'<>]+type=signup[^\s"'<>]*/i);
          if (match) {
            verifyUrl = match[0].replace(/&amp;/g, "&");
            break;
          }
        }
      }
      if (verifyUrl) break;
      await new Promise((r) => setTimeout(r, 5000));
    }

    if (!verifyUrl) {
      throw new Error("Verification email not found after 12 attempts");
    }
    yield { step: "poll_inbox", status: "done", detail: "Verification link found" };

    // Step 7: Verify link
    yield { step: "verify_link", status: "running", detail: "Verifying email..." };
    await fetch(verifyUrl);
    yield { step: "verify_link", status: "done", detail: "Email verified" };
    updateAffiliateAccount(accountId, { status: "verified" });

    // Step 8: Get token
    yield { step: "get_token", status: "running", detail: "Getting access token..." };
    const tokenRes = await getToken(email, data.password);
    const accessToken = tokenRes.data.accessToken;
    yield { step: "get_token", status: "done", detail: "Access token obtained" };
    updateAffiliateAccount(accountId, { access_token: accessToken, status: "token_obtained" });

    // Step 9: Get user info + setup profile
    yield { step: "setup_profile", status: "running", detail: "Setting up profile..." };
    const userMe = await getUserMe(accessToken);
    const orgId = userMe.data.organizationId;
    await setupProfile(accessToken, {
      firstName: data.first_name,
      lastName: data.last_name,
      organizationName: data.org_name,
      timezone: data.timezone,
    });
    yield { step: "setup_profile", status: "done", detail: "Profile setup complete" };
    updateAffiliateAccount(accountId, { org_id: orgId, status: "setup_done" });

    // Step 10: Create API key
    yield { step: "create_api_key", status: "running", detail: "Creating API key..." };
    const keyRes = await createApiKey(accessToken, orgId, data.name);
    yield { step: "create_api_key", status: "done", detail: keyRes.data.key };
    updateAffiliateAccount(accountId, {
      api_key: keyRes.data.key,
      api_key_id: keyRes.data.id,
      status: "done",
    });

    yield { step: "complete", status: "done", detail: "Onboarding complete!" };
  } catch (e: any) {
    if (accountId) {
      updateAffiliateAccount(accountId, { status: "failed", error: e.message });
    }
    yield { step: "error", status: "failed", detail: e.message };
  }
}