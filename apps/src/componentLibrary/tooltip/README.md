# `apps/src/componentLibrary/tooltip`

## Consuming This Component

This package exports following styled React
components: [WithTooltip](./WithTooltip.tsx), [Tooltip](T_ooltip.tsx), [TooltipOverlay](Tooltip.tsx).

`WithTooltip` is a recommended way to use a tooltip. It wraps `TooltipOverlay` and `Tooltip` components and provides a
way to add tooltip to any element, handles all the logic behind showing and hiding, positioning and accessibility of the
tooltip.

***Here's a recommended way*** to use `WithTooltip` component and adding Tooltips where needed in general:

```javascript
import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

const ComponentWithTooltip = () => (
    <WithTooltip tooltipProps={tooltipProps}>
        <button>Hover over me</button>
    </WithTooltip>
);
```

Please note that it's required that `children` prop/component of `WithTooltip` component will be a single element
and will support adding `aria-describedBy` attribute to it.

------
 For guidelines on how to use these components and the features they
offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [Design System / Tooltip Component](http://localhost:9001/?path=/story/designsystem-tooltip--default-tooltip).
------

##### Custom usage of `Tooltip` and `TooltipOverlay` components is not recommended, but still possible.

If you'll need to use `Tooltip` and `TooltipOverlay` for some custom behavior, you can do it, just remember that you'll
need to handle all the logic with showing and hiding, positioning and some accessibility aspects of the tooltip
yourself.

In order to add tooltip to some element, you need to wrap it with TooltipOverlay component and add Tooltip component
inside it. You'll need to provide `id` prop to Tooltip component and `aria-describedby` prop to the element
you want to add tooltip to.

You can import it like this:

```javascript
import Tooltip, {TooltipOverlay} from '@cdo/apps/componentLibrary/tooltip';
import moduleStyles from './styles.module.scss'; // some scss module with tooltip positioning styles

const ComponentWithTooltip = () => {
    // Handle showing and hiding of the tooltip via state or with the help of scss styles
    return (
        <TooltipOverlay>
            <button aria-describedby="tooltip1">Hover over me</button>
            <Tooltip id="tooltip1" text="This is a tooltip" className={moduleStyles.customTooltipStyles}/>
        </TooltipOverlay>
    );
}
```
