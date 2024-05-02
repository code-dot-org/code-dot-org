# `apps/src/componentLibrary/tolltip`

## Consuming This Component

This package exports two styled React component: [Tooltip](Tooltip.tsx), [TooltipOverlay](Tooltip.tsx).

In order to add tooltip to some element, you need to wrap it with TooltipOverlay component and add Tooltip component
inside it. You'll need to provide `id` prop to Tooltip component and `aria-describedby` prop to the element
you want to add tooltip to.

You can import it like this:

```javascript
import Tooltip, {TooltipOverlay} from '@cdo/apps/componentLibrary/tooltip';


const ComponentWithTooltip = () => (
    <TooltipOverlay>
        <button aria-describedby="tooltip1">Hover over me</button>
        <Tooltip id="tooltip1" text="This is a tooltip" />
    </TooltipOverlay>
);
```

For guidelines on how to use these components and the features they offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go to [Design System / Tooltip Component](http://localhost:9001/?path=/story/designsystem-tooltip--default-tooltip).