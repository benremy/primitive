'use client'

import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

interface Message {
  role: 'user' | 'assistant'
  body: string
}

// ── Shell ─────────────────────────────────────────────────────────────────────
// Full viewport, mobile-first column. On desktop, centers to a card.

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
  background: #f0f0f0;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  color: #111;

`

// ── Bento blocks ──────────────────────────────────────────────────────────────
// Each section is a distinct, full-width box. No overlap, no bleeding.

const HeaderBlock = styled.header`
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 1.25rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  flex-shrink: 0;
`
const MessagesBlock = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f0f0f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
const InputBlock = styled.div`
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 0.875rem 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  flex-shrink: 0;
`

// ── Message bubbles ───────────────────────────────────────────────────────────

const BubbleRow = styled.div<{ $user: boolean }>`
  display: flex;
  justify-content: ${p => p.$user ? 'flex-end' : 'flex-start'};
`
const Bubble = styled.div<{ $user: boolean }>`
  background: ${p => p.$user ? '#111' : '#fff'};
  color:      ${p => p.$user ? '#fff' : '#111'};
  border: 1px solid ${p => p.$user ? '#111' : '#e0e0e0'};
  border-radius: 10px;
  padding: 0.625rem 0.875rem;
  max-width: 82%;
  line-height: 1.55;
`
const EmptyHint = styled.p`
  color: #bbb;
  text-align: center;
  margin-top: 3rem;
`

// ── Input controls ────────────────────────────────────────────────────────────

const Textarea = styled.textarea`
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.625rem 0.75rem;
  background: #f9f9f9;
  color: #111;
  outline: none;
  &:focus { border-color: #bbb; }
  &::placeholder { color: #ccc; }
`
const SendButton = styled.button`
  font-family: inherit;
  font-size: 14px;
  background: #111;
  color: #fff;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  flex-shrink: 0;
  &:hover:not(:disabled) { background: #333; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const updated: Message[] = [...messages, { role: 'user', body: text }]
    setMessages(updated)
    setInput('')
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: messages }),
    })
    const data = await res.json()
    setMessages([...updated, { role: 'assistant', body: data.message }])
    setLoading(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <Shell>
      <HeaderBlock>jodi</HeaderBlock>

      <MessagesBlock>
        {messages.length === 0 && <EmptyHint>say something.</EmptyHint>}

        {messages.map((m, i) => (
          <BubbleRow key={i} $user={m.role === 'user'}>
            <Bubble $user={m.role === 'user'}>{m.body}</Bubble>
          </BubbleRow>
        ))}

        {loading && (
          <BubbleRow $user={false}>
            <Bubble $user={false} style={{ color: '#bbb', borderColor: '#eee' }}>...</Bubble>
          </BubbleRow>
        )}

        <div ref={bottomRef} />
      </MessagesBlock>

      <InputBlock>
        <Textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="message..."
        />
        <SendButton onClick={send} disabled={loading || !input.trim()}>
          send
        </SendButton>
      </InputBlock>
    </Shell>
  )
}
