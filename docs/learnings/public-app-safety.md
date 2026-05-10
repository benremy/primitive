# Public App Safety (No Auth)

For any public-facing AI chat app without authentication, add these in priority order:

## High Priority
- **Message length cap** — reject inputs over ~2000 chars in the route handler
- **History depth cap** — only send the last N messages to the AI, not unbounded history
- **AI safety settings** — explicitly configure harassment/hate/dangerous content thresholds on the model

## Medium Priority
- **Rate limiting** — IP-based request throttle (e.g. 10 req/min) using an in-memory `Map`, no package needed

## Lower Priority
- **Spend alerts** — set a budget alert in the AI provider's console before costs spike
- **Kill switch** — an env var like `CHAT_ENABLED=false` you can flip without a redeploy
