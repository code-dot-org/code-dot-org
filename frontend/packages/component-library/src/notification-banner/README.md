# `componentLibrary/notification-banner`

## Consuming This Component

This package exports a styled React component: [NotificationBanner](NotificationBanner.tsx).
You can import it like this:

```javascript
import NotificationBanner, {
  NotificationBannerProps,
} from '@code-dot-org/component-library/notification-banner';
```

## Features

- **7 sentiments**: `brand`, `pink`, `neutral`, `success`, `error`, `warning`, `info`
- **2 fills**: `none` (neutral surface) or `color` (sentiment-tinted surface)
- **Optional actions**: pass 1–2 buttons; the slot is omitted when `actions` is absent
- **Optional close**: pass `onClose` to show the dismiss control
- **Accessibility**: ARIA roles (`status` or `alert`) with the matching `aria-live` value
- **Built on MUI**: `Paper`, `Typography`, and `IconButton`

## Usage Examples

### Basic usage

```jsx
import NotificationBanner from '@code-dot-org/component-library/notification-banner';

<NotificationBanner
  sentiment="info"
  title="This is a title"
  description="This is additional descriptive text."
  icon={{iconName: 'circle-info', iconStyle: 'solid'}}
/>;
```

### Color fill and actions

```jsx
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button} from '@mui/material';

<NotificationBanner
  sentiment="info"
  fillStyle="color"
  title="More opportunities for feedback"
  description="Each lesson now includes a quick 2-question survey."
  icon={{iconName: 'envelope', iconStyle: 'solid'}}
  actions={
    <>
      <Button variant="outlined" color="primary" size="small">
        Cancel
      </Button>
      <Button variant="contained" color="secondary" size="small">
        Submit
      </Button>
    </>
  }
/>;
```

### Dismissible

```jsx
<NotificationBanner
  sentiment="warning"
  title="You're in a newer version"
  description="We noticed you have progress in an older version."
  icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
  onClose={() => console.log('Closed')}
/>
```

## Props

See [NotificationBannerProps](NotificationBanner.tsx).

`sentiment` and `fillStyle` are the Figma Sentiment and Fill Style axes.
`actions` stands in for the Has Actions boolean, and `onClose` stands in for
Is Dismissible, because both need real content and a click handler.
Title, description, and the icon are content props (`icon` is the library
icon's props; Figma stores only the glyph name).

For guidelines, run Storybook and open
[DesignSystem / NotificationBanner](http://localhost:6006/?path=/docs/designsystem-notificationbanner--docs).
