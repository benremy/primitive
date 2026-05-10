# Gemini Model Names

**Problem:** Unversioned aliases like `gemini-2.0-flash` and pinned versions like `gemini-2.0-flash-001` are restricted to existing API keys. New keys get a 404.

**Rule:** Always use the current generation model. As of 2026, that is `gemini-2.5-flash` (or `gemini-2.5-pro` for heavier tasks).

**Check:** [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) — verify the model name before wiring up a new API key.
