# Catalog

The course catalog is the landing page at `/app`. Each card is one
`CourseEntry` in `courses.ts`.

This README is for **anyone adding a course** — engineers, PMs, curriculum
authors, hackathon participants. You do not need React experience.

## Add a course in 60 seconds

1. Open `courses.ts` in this folder.
2. Copy one of the existing entries.
3. Paste it at the end of the `COURSES` array.
4. Change the fields. Save.
5. Open a pull request.

That's it. The catalog rebuilds automatically; your card appears on
`/app` the next time the dev server reloads or production deploys.

## What each field means

```ts
{
  schemaVersion: 1,
  // Schema version — leave this as 1 until you're told otherwise.

  slug: 'my-course',
  // Short, URL-safe name. Lowercase, hyphens-not-spaces.
  // Becomes the URL: /app/courses/my-course

  title: 'My Course',
  // Card heading.

  summary: 'One sentence, around 120 characters.',
  // Body text on the card. Keep it short — the card has limited space.

  cover: coverPlaceholder,
  // Cover image. For now, leave as `coverPlaceholder` — the existing
  // CDO logo is used as a stand-in. When you have a real cover, drop
  // it in `src/config/brand/assets/courses/<slug>.webp` and import it.

  level: 'K-5',
  // Optional. Shown as a chip. Allowed values: 'K-2', 'K-5', '3-5',
  // '6-8', '9-12', 'All ages'.

  // Then pick exactly ONE of the following three options:

  // Option A — Route to a working in-app lab:
  module: 'oceans',         // must match a registered lab
  demoChannelId: '1',       // any numeric id; '1' is the demo channel

  // Option B — Link out to an existing studio.code.org course:
  externalUrl: 'https://studio.code.org/s/dance-2024',

  // Option C — Show a default "Coming soon" detail page at /app/courses/<slug>:
  // (just leave both `module` and `externalUrl` undefined)
}
```

## Two examples

### Content-only stub (no lab, no external link yet)

```ts
{
  schemaVersion: 1,
  slug: 'data-explorers',
  title: 'Data Explorers',
  summary: 'Visualize and analyze real datasets. Coming soon.',
  cover: coverPlaceholder,
  level: '6-8',
}
```

Clicking the card takes the student to `/app/courses/data-explorers`,
which shows a default detail page with a "Coming soon" CTA linking to
`https://studio.code.org/courses/data-explorers`.

### Working lab card

```ts
{
  schemaVersion: 1,
  slug: 'maze',
  title: 'Maze',
  summary: 'Guide a character through a maze using simple commands.',
  cover: coverPlaceholder,
  level: 'K-2',
  module: 'maze',
  demoChannelId: '1',
}
```

Clicking takes the student straight into the maze lab.

## What if I need something custom?

If "default detail page + studio.code.org link" doesn't fit and you need
a custom interaction (a video player, a quiz, a Duolingo-style lesson
path), you need a **module**, not just a course entry. That requires an
engineer.

The path forward: file an issue or talk to platform engineering. The
module gets implemented; the course entry then sets `module: '<your-id>'`.

## How this will change (you don't need to do anything)

The team is moving from "one TS array of all courses" to "one folder per
course" — each course will live in
`src/modules/catalog/courses/<slug>/` with its own `course.json`,
optional `landing.mdx`, and cover image. When that lands, your TS entry
gets migrated automatically. Same fields, just a different file.

## Troubleshooting

- **My card isn't showing up.** Did you save `courses.ts`? Is the dev
  server running? (`yarn workspace @code-dot-org/studio dev`.) Check
  the browser console for errors — the per-card error boundary will
  show a "failed to render" message instead of hiding silently.
- **My slug clashes with another course.** Pick a different slug. The
  TS compiler doesn't enforce uniqueness yet (Future: Zod will).
- **My cover image looks wrong.** Cover images are letterboxed inside
  the card with a dark teal background. Use a transparent PNG or WebP
  with the subject centered, ~600×400 px ideal.
