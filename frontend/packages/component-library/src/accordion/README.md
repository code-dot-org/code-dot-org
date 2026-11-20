# `component-library/accordion`

## Consuming This Component

Use [MuiAccordion](MuiAccordion.tsx) and
[MuiFAQAccordion](faqAccordion/MuiFAQAccordion.tsx). They take the legacy
props unchanged and render MUI `Accordion` items, styled by the
`MuiAccordion`, `MuiAccordionSummary` and `MuiAccordionDetails` entries in
[`styleOverrides/accordion.ts`](../themes/code.org/styleOverrides/accordion.ts).

```javascript
import {MuiAccordion} from '@code-dot-org/component-library/accordion';

import {MuiFAQAccordion} from '@code-dot-org/component-library/accordion';

import {MuiFAQAccordion} from '@code-dot-org/component-library/accordion/faqAccordion';
```

The legacy [Accordion](Accordion.tsx) and
[FAQAccordion](faqAccordion/FAQAccordion.tsx) are deprecated and still
exported under their old names, including the default export. The props
are unchanged, so moving a call site is an import edit.

A bare `Accordion` from `@mui/material` gets the same look from the theme.
Pass the chevron as its `expandIcon`; the theme colors and flips it:

```tsx
<Accordion>
  <AccordionSummary
    id="faq-1-summary"
    aria-controls="faq-1-panel"
    expandIcon={
      <FontAwesomeV6Icon iconName="chevron-down" aria-hidden="true" />
    }
  >
    <Typography variant="body2" component="span">
      <Typography variant="strong">Question</Typography>
    </Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography variant="body2">Answer</Typography>
  </AccordionDetails>
</Accordion>
```

The bare one keeps MUI's own `<h3>`, `role="region"` and height animation,
which `MuiAccordion` turns off. MUI names the region only from the
summary's `id` and `aria-controls`; without them the region is unnamed. See
[ACCORDION_MIGRATION_TO_MUI.md](ACCORDION_MIGRATION_TO_MUI.md) for the
migration plan and its deferred changes.

For guidelines on how to use this component and the features it
offers, [visit Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [Accordion / MuiAccordion](http://localhost:6006/?path=/docs/designsystem-accordion-muiaccordion--docs).
