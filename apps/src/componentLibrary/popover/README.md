# `apps/src/componentLibrary/popover`

## Consuming This Component

This package exports following styled React component: [Popover](Popover.tsx), [WithPopover](WithPopover.tsx).

`WithPopover` is recommended to use when you need to render a `Popover` positioned relative to some element.
It wraps `Popover` component and provides a way to add popover to any element, just make sure you also pass
`showPopover` porp correctly to handle open/close `Popover` state.

***Example*** how to use `WithPopover` component:

```javascript
import {WithPopover} from '@cdo/apps/componentLibrary/popover';

const ComponentWithPopover = () => {
    const [showPopover, setShowPopover] = useState(false);
    const popoverProps = {
        title: 'Popover title',
        content: 'Popover content',
        direction: 'top',
    };
    
    return (
        <WithPopover
            showPopover={showPopover}
            popoverProps={popoverProps}
        >
            <button onClick={() => setShowPopover(!showPopover)}>Click me</button>
        </WithPopover>
    );
}
```
This will render a button that will toggle popover with title and content when clicked.

***Important(!)***: `Popover` rendered via `WithPopover` component will be disabling scroll event when `Popover`
is shown. It's done in order to improve accessibility and make sure user won't scroll away from the `Popover`
(`Popover` is meant to be interacted with high priority)

*Please note* that it's required that `children` prop/component of `WithPopover` component will be a single element.

---

`Popover` is recommended to use  when you want to render a `Popover` that is not positioned relative to some element
and you want to handle it's positioning by yourself. (`direction: 'none'`)

***Example*** how to use `Popover` component:

```javascript
import Popover from '@cdo/apps/componentLibrary/popover';

const ScreenWithPopover = () => {
    const popoverProps = {
        title: 'Popover title',
        content: 'Popover content',
        direction: 'none',
    };
    
    return (
        <div>
            <Popover
                direction='none'
                title='Custom positioned popover'
                content='Some content text'
                style={{bottom: 0, right: 0}}
            />
        </div>
    );
}
```
This will render a popover with title and content positioned at the bottom right corner of the screen.

------
For guidelines on how to use these components and the features they
offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [Design System / Popover Component](http://localhost:9001/?path=/docs/designsystem-popover--docs).
------
