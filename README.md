# Jony Math

Simple practice app for early‑grade math in Czech. It includes fast drills for addition/subtraction and a “Slovní úlohy” module with short, child‑friendly word problems that students convert into equations.

## Features

- Arithmetic drills with modes: sčítání, odčítání, nebo smíšené
- Word problems with an equation builder (a ? op ? = ?)
  - Operator is not preselected; student must choose `+` or `-`
  - Results summary with first wrong attempt for review
- Quick session sizes for fast testing (1–2 items) and longer sets

## Getting Started

- Install dependencies: `yarn`
- Start dev server: `yarn dev`
- Build: `yarn build`
- Preview build: `yarn preview`

Requirements: Node 18+ and Yarn (or use `npm run` equivalents).

## App Structure

- Word problem data: `src/data/wordProblems.ts:1`
- Word problems store and settings: `src/stores/word.ts:1`
- Arithmetic store and settings: `src/stores/session.ts:1`
- Word problem card (equation builder UI): `src/components/WordProblemCard.vue:1`
- Root UI and setup flows: `src/App.vue:1`

## Configuration

- Arithmetic session options (mode, count, max) are defined in `src/App.vue:63` (`countOptions`, `maxOptions`) and defaults in `src/stores/session.ts:28` (`defaultSettings`).
- Word problems quick counts (including 1 and 2 for quick testing) are defined in `src/App.vue:61` (`wordCountOptions`). The default word‑session count is in `src/stores/word.ts:97` (`wordDefaultSettings`).

## Editing Word Problems

Word problems live in `src/data/wordProblems.ts:10` as an array. Each entry follows:

```
{
  id: string,
  text: string,      // short, clear Czech; use full stops between clauses
  a: number,         // 0–20
  b: number,         // 0–20
  op: '+' | '-',     // operation in the correct solution
  result: number     // computed result (for checking and summary)
}
```

Guidelines used in this project:
- Numbers up to 20; for addition, sums do not exceed 20
- Avoid the repetitive “Mám X, dostanu Y” phrasing; keep sentences natural for 2nd grade
- Prefer a full stop between the story and the final question (e.g., “… Přibylo 3. Kolik je celkem?”)

## Notes

- Keyboard: Enter submits an answer where applicable.
- Review flow: After the first pass, only incorrect items are repeated until correct; the summary shows mistakes and first wrong attempts.
