# ADR 001 — Tailwind over Styled Components

**Status:** Accepted

## Context

Styled-components offers props-driven styles, scoped CSS, and TypeScript integration. This is useful when styles are heavily driven by runtime JS values — things like user-defined themes, color pickers, or complex animation state.

Tailwind with conditional class names (e.g. ternaries or `clsx`) covers the same dynamic styling need for most UI components without a runtime dependency.

## Decision

Use Tailwind for all styling. Do not introduce styled-components.

## Reasoning

- Tailwind conditional classes already handle role-driven or state-driven style changes cleanly
- Styles stay colocated with markup — no jumping between files
- Zero runtime cost — Tailwind is compiled CSS, styled-components adds a JS runtime
- `clsx` or `cn()` can be added later if ternaries get unwieldy, still no new paradigm

## When to revisit

If components accumulate many props each driving many style decisions, or if runtime theming (user-defined colors, dynamic design tokens) becomes a requirement, styled-components becomes worth the tradeoff.
