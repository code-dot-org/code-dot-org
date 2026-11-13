# `component-library/accordion/faqAccordion`

## Consuming This Component

Use [MuiFAQAccordion](MuiFAQAccordion.tsx): a
[MuiAccordion](../MuiAccordion.tsx) plus the FAQPage JSON-LD script Google
reads. You can import it like this:

```javascript
import {MuiFAQAccordion} from '@code-dot-org/component-library/accordion/faqAccordion';
```

The legacy [FAQAccordion](FAQAccordion.tsx) is deprecated and still exported,
including as the default export. The props are unchanged, so moving a call
site is an import edit. See
[ACCORDION_MIGRATION_TO_MUI.md](../ACCORDION_MIGRATION_TO_MUI.md) and the
[accordion README](../README.md) for composing a bare MUI `Accordion`.

For guidelines on how to use this component and the features it
offers, [visit Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [Accordion / MuiFAQAccordion](http://localhost:6006/?path=/docs/designsystem-accordion-muifaqaccordion--docs).
