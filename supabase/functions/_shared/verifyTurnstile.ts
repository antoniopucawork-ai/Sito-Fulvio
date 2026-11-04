const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const ALLOWED_HOSTNAME = "dottor-fulvio.netlify.app";

export const verifyTurnstile = async (token: unknown): Promise<boolean> => {
  if (typeof token !== "string" || !token.trim() || token.length > 2048) {
    return false;
  }

  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");

  if (!secret) {
    console.error("Secret Turnstile non configurata.");
    return false;
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return false;

    const result = await response.json();

    return result.success === true && result.hostname === ALLOWED_HOSTNAME;
  } catch {
    console.error("Verifica Turnstile non riuscita.");
    return false;
  }
};
