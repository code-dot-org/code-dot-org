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

- **8 Variants**: `primary`, `brand`, `info`, `success`, `warning`, `error`, `ai`, `gray`
- **2 Styles**: `subtle` (white background) or `filled` (tinted background/color border)
- **Optional Actions**: Support for 1-2 action buttons
- **Optional Close**: Dismissible with close button
- **Accessibility**: ARIA roles (`status` or `alert`) with appropriate `aria-live` attributes
- **Built on MUI**: Uses MUI `Paper` and `Stack` components with DSCO theme

## Usage Examples

### Basic Usage

```jsx
import NotificationBanner from '@code-dot-org/component-library/notification-banner';

<NotificationBanner
  variant="info"
  style="subtle"
  title="This is a title"
  description="This is additional descriptive text."
  icon={{iconName: 'circle-info', iconStyle: 'solid'}}
/>;
```

### With Actions

```jsx
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button} from '@mui/material';

<NotificationBanner
  variant="info"
  style="subtle"
  title="More Opportunities for Feedback"
  description="Each lesson now includes a quick 2-question survey..."
  icon={{iconName: 'envelope', iconStyle: 'solid'}}
  actions={
    <>
      <Button variant="outlined" color="secondary">
        Cancel
      </Button>
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </>
  }
/>;
```

### With Close Handler

```jsx
<NotificationBanner
  variant="warning"
  style="subtle"
  title="You're in a newer version"
  description="We noticed you have progress in an older version..."
  icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
  onClose={() => console.log('Closed')}
/>
```

### Alert Role (Urgent)

```jsx
<NotificationBanner
  variant="error"
  style="subtle"
  title="Critical Error"
  description="This requires immediate attention."
  icon={{iconName: 'circle-xmark', iconStyle: 'solid'}}
  role="alert"
/>
```

## Props

See [NotificationBannerProps](NotificationBanner.tsx) for full prop definitions.

For guidelines on how to use this component and the features it
offers, [visit Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [DesignSystem / NotificationBanner](http://localhost:9001/?path=/docs/designsystem-notificationbanner--docs).
