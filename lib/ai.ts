import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// single client instance reused across all requests
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// block medium+ harmful content across all four categories — applies to every model call
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

export async function ask(
  message: string,
  history: { role: string; body: string }[], // prior turns, already capped by route.ts
  system = 'You are a helpful assistant'      // override this to change the AI persona
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',  // swap to gemini-2.5-pro for smarter but slower responses
    systemInstruction: system,
    safetySettings,
  })

  const chat = model.startChat({
    // Gemini expects 'user' or 'model' — map our internal 'assistant' role to 'model'
    history: history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.body }],
    })),
  })

  const result = await chat.sendMessage(message)
  return result.response.text()
}
