# 10 — District LMS administrator: connect Canvas

**Verdict: PARTLY**

## Path taken
- CodeAI Documentation (home) — start
- Connect your LMS to CodeAI (District administrators > Integration) — 1 click
- What LMS integration provides (via Next steps link) — 2 clicks (revealed Canvas limitation)

## Answering sentence
For how to connect: "Go to studio.code.org/lti/v1/integrations/new" with fields (School name, LMS Client ID, email, LMS).

For the Canvas limitation: "Deep linking is not yet available for Canvas. Canvas launches use a default target link." and "No deep linking on Canvas. Content selection within Canvas is not supported; teachers launch CodeAI's default landing page."

## Confusion points
- "Anyone with a CodeAI account can register an integration" — assumes the persona has a CodeAI account. Page never says whether being signed in is required, never links to account creation. Expected: "you'll need a CodeAI account; create one here."
- "LMS Client ID" field references an external support.code.org article for "step-by-step instructions per platform." The actual Canvas-side configuration lives entirely off this docs site. Expected: the Canvas admin menu path on the same site.
- Canvas deep-linking limitation only discovered on the SECOND page, not the registration page. The principal's ask ("teachers can assign from Canvas") is not actually possible. Expected: this limitation stated on the registration page before doing the work.
- "Canvas (including Canvas Beta and Canvas Test instances)" listed with no explanation of when to use Beta/Test vs production. Unexplained jargon.

## Screenshots
- Registration form screenshot on connect-your-lms: noise. Identical to the bullet list already describing each field.
- Missing: screenshot of the Canvas admin "External Apps" / dynamic-registration screen — the one foreign part of the flow.

## Product test
Form at /lti/v1/integrations/new loaded as documented. Filled with placeholder data (fake Client ID "10000000000001"). Registration succeeded — product accepted the placeholder without validating against a live Canvas instance. Could not test whether anonymous visitors are blocked (was already signed in).

## Three wishes
1. "State Canvas's deep-linking and gradebook limitations at the top of the Connect page, not buried on a second page."
2. "Say explicitly that you need a CodeAI account and link to account creation."
3. "Spell out the Canvas admin menu path (Admin > Developer Keys > + LTI Key) on this site instead of deferring to an external article."
