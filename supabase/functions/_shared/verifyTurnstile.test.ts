import { verifyTurnstile } from "./verifyTurnstile.ts";

// ========================================
// TEST SICUREZZA CLOUDFLARE TURNSTILE
// ========================================

// Simuliamo le risposte di Cloudflare.
// Non vengono effettuate chiamate reali
// e non viene contattato il database Supabase.

Deno.test("Verifica sicurezza Turnstile", async () => {
  // Conserviamo il fetch originale
  const originalFetch = globalThis.fetch;

  try {
    // ========================================
    // TEST 1 - TOKEN MANCANTE
    // ========================================

    const missingToken = await verifyTurnstile("");

    if (missingToken !== false) {
      throw new Error("ERRORE: il token mancante è stato accettato.");
    }

    // ========================================
    // TEST 2 - TOKEN VALIDO
    // ========================================

    globalThis.fetch = () =>
      Promise.resolve(
        Response.json({
          success: true,
          hostname: "dottor-fulvio.netlify.app",
        }),
      );

    const validToken = await verifyTurnstile("token-di-prova");

    if (validToken !== true) {
      throw new Error("ERRORE: il token valido è stato rifiutato.");
    }

    // ========================================
    // TEST 3 - TOKEN NON VALIDO O SCADUTO
    // ========================================

    globalThis.fetch = () =>
      Promise.resolve(
        Response.json({
          success: false,
          "error-codes": ["timeout-or-duplicate"],
        }),
      );

    const expiredToken = await verifyTurnstile("token-di-prova");

    if (expiredToken !== false) {
      throw new Error("ERRORE: il token scaduto è stato accettato.");
    }

    // ========================================
    // TEST 4 - DOMINIO NON AUTORIZZATO
    // ========================================

    globalThis.fetch = () =>
      Promise.resolve(
        Response.json({
          success: true,
          hostname: "sito-non-autorizzato.example",
        }),
      );

    const invalidHostname = await verifyTurnstile("token-di-prova");

    if (invalidHostname !== false) {
      throw new Error("ERRORE: un dominio non autorizzato è stato accettato.");
    }
  } finally {
    // ========================================
    // RIPRISTINO FETCH ORIGINALE
    // ========================================

    globalThis.fetch = originalFetch;
  }
});
