# `componentLibrary/tags`

## Consuming This Component

This package exports two components: [Tags](Tags.tsx) and [Tag](Tag.tsx). You can import them like this:

```javascript
import Tags, {Tag} from '@code-dot-org/component-library/tags';
```

### Tag (single chip)

Use `Tag` when you need a single chip-like tag. The `Tags` component remains a convenience wrapper for rendering a list.
`Tag` supports `variant` (`light` or `solid`) and sentiment-based `color` options.

```javascript
<Tag label="New" variant="light" color="teal" />
```

For guidelines on how to use these components and the features they offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go to [Design System / Tags](http://localhost:9001/?path=/story/designsystem-tags-component--default-tags).
