# CodeAI Accessibility Build Checklist

The canonical engineering checklist used at CodeAI to decide what is and is not
accessible yet. Treat it as ground truth; the `accessibility` skill operationalizes
it for this repo. When the skill and this checklist disagree, the checklist wins —
update the skill.

## 1. Use semantic HTML (Axe DevTools scans for this)

- **Use DSCO when possible, native elements when not:** `<button>`, `<a href>`,
  `<label>`, `<h1>`–`<h6>`, `<ul>`/`<ol>`/`<li>`, `<fieldset>`/`<legend>`, etc. They
  come with focus, role, and keyboard behavior built in.
- **Links go places, buttons do things.** Use anchors for links, buttons for events.
  If you must use a `<div>`, add all the appropriate labelling, tab indexing, and key
  handlers yourself.
- **Heading hierarchy is a content outline.** One `<h1>` per page. Descend in order
  (h2 → h3); do not skip levels to get a font size — the design system supports proper
  headers at any font size.

## 2. Make it keyboard-operable

- **Tab order matches the visible order.** Never use `tabindex` greater than `0`. Use
  `tabindex="0"` only to make a non-interactive container focusable, and
  `tabindex="-1"` for programmatic focus targets.
- **Focus must be visible.** If you remove the default outline, replace it with a
  `:focus-visible` style at ≥ 3:1 contrast against its background.
- **Use the enter/escape paradigm to nest complex interactions:** when there are too
  many tab stops for the ordinary page hierarchy (e.g. a chat history), or when you
  enter a text editor where Tab means something else.
- **Use keyboard shortcuts as needed** and make the interaction explicit both visually
  and to a screen reader.
- **Every interactive thing works with the keyboard.** Buttons: Enter + Space. Links:
  Enter. Menus/tabs/radios: arrow keys, Space to select. Modals: Esc closes and returns
  focus to the trigger.
- **No *unintentional* keyboard traps.** You must be able to Tab out of every component, including
  custom widgets and embeds — the exception is a modal you deliberately trap focus in (see below).
- **Manage focus on transitions.** On route change, move focus to the new `<h1>` (or
  main heading). On modal open, focus the dialog; on close, return to the trigger.
- **Avoid if possible:** tooltips, overlapping dialogs/modals, actions on hover.
- **Trap focus when it is meant to be trapped:** if you display a popup the user must
  interact with, do not let them tab past it onto the content behind.

## 3. Give everything a name (Axe scans for this too)

- **Every form control has a programmatic label** — `<label for="id">` or a wrapping
  `<label>`. Placeholders are not labels, and visual tooltips alone are not labels.
- **Group related controls.** Radio sets and checkbox groups go in `<fieldset>` with a
  `<legend>`.
- **Every `<img>` has alt text.** Descriptive alt for informative images; `alt=""` for
  decorative. Icon SVGs: `aria-hidden="true"` if decorative, `aria-label` if meaningful.
- **Icon buttons need labels.**
- **Visible and aria labels convey intent:** "Submit application," not "click here."
- **Errors are tied to fields.** Use `aria-describedby` to point at the error message and
  `aria-invalid="true"` on the field. Never communicate state with color alone.

## 4. Color, contrast, and media

- **Contrast minimums.** 4.5:1 for body text; 3:1 for large text (≥ 24px, or 18.66px
  bold) and for UI components / meaningful icons / focus rings.
- **Color is never the only signal.** Pair it with text, an icon, underline, or pattern.
- **Video has captions; audio has a transcript.** Embedded media (YouTube, Vimeo) must
  have captions enabled on the source file, not just auto-generated.

## 5. Self-test: keyboard

- Click the browser address bar, then Tab through the page top to bottom.
- Confirm every interactive element receives focus, the focus ring is clearly visible at
  every stop, and the order matches what you see.
- Activate each element — Enter on links, Enter and Space on buttons. Confirm controls do
  their job from the keyboard and that you are never trapped.
- Open every modal, menu, dropdown, and accordion. Verify Esc closes them and focus lands
  back on the thing that opened them.
- Shift+Tab backwards to confirm reverse order also works.

## 6. Self-test: screen reader

Pick one: VoiceOver on Mac (Cmd+F5 to toggle), NVDA on Windows (free at nvaccess.org), or
Orca on Linux. All are fine for smoke-testing.

Complete the activity with your eyes closed:

- Do you know where you are on the page at all times?
- Can you figure out navigation tricks outside the expected arrows/tabs?
- Can you tell when you are done with the level?
- Do you get screen-reader feedback on progress?
- Are you informed of errors that arise?
- Did you learn the same things a sighted person was supposed to learn?
- Did the screen reader help you understand different regions of the screen? (Did you know
  when you were entering an "application"? Did you know when you were tabbing through a
  "list"?)
- Are live-loading elements read aloud via aria-live? (Did the chatbot message read when it
  appeared? Did the "thinking" state get announced so you knew what you were waiting for?)
