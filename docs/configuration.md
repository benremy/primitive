# Configuration Guide

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | From [aistudio.google.com](https://aistudio.google.com) |
| `CHAT_ENABLED` | No | `true` | Set to `false` to disable chat without redeploying |

---

## AI Model (`lib/ai.ts`)

### Switching models
Change the `model` string in `getGenerativeModel`:
```ts
model: 'gemini-2.5-flash'   // fast, cheap — default
model: 'gemini-2.5-pro'     // smarter, slower, more expensive
```
Always verify the name is current at [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) — aliases like `gemini-2.0-flash` get retired for new API keys.

### System prompt
The `system` parameter defaults to `'You are a helpful assistant'`. Pass a different string from the route to change the persona without touching `lib/ai.ts`:
```ts
ask(message, history, 'You are a pirate who only speaks in rhymes.')
```

### Safety settings
Four categories, each tunable independently:
```ts
HarmBlockThreshold.BLOCK_NONE               // no filtering
HarmBlockThreshold.BLOCK_ONLY_HIGH          // block only the worst
HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE   // default — balanced
HarmBlockThreshold.BLOCK_LOW_AND_ABOVE      // strictest
```
Categories: `HARM_CATEGORY_HARASSMENT`, `HARM_CATEGORY_HATE_SPEECH`, `HARM_CATEGORY_DANGEROUS_CONTENT`, `HARM_CATEGORY_SEXUALLY_EXPLICIT`.

---

## Request Guards (`app/api/chat/route.ts`)

### Rate limiting
```ts
recent.length >= 10   // max requests per window
now - t < 60_000      // window in ms (60s)
```
Tracked per IP in-memory — resets on server restart. Increase the limit for trusted use cases, decrease for tighter abuse control.

### Message length cap
```ts
message.length > 2000
```
Prevents prompt injection attacks and runaway token costs. Adjust based on your use case.

### History depth cap
```ts
(history ?? []).slice(-20)
```
Only the last 20 messages are sent to Gemini per request. Lower this to reduce token usage and cost; raise it if context continuity matters more.

### Kill switch
Set `CHAT_ENABLED=false` in `.env.local` (or your hosting env vars) to return a 503 immediately without touching code or redeploying.
