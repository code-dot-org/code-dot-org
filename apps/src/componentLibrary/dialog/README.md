# `apps/src/componentLibrary/dialog`

## Consuming This Component

This package exports two styled React components: [Dialog](Dialog.tsx), [CustomDialog](CustomDialog.tsx).
You can import them like this:

```javascript
import Dialog, {DialogProps} from '@cdo/apps/componentLibrary/dialog';

import {Dialog, DialogProps} from '@cdo/apps/componentLibrary/dialog';

import {CustomDialog, CustomDialogProps} from '@cdo/apps/componentLibrary/dialog';
```

## Using Dialog vs CustomDialog

`Dialog` is a general purpose dialog component with predefined styles and content structure that should be used in most
cases.

`CustomDialog` is a base component that can be used to create custom dialogs with custom content and styles.
`CustomDialog` only has general dialog logic like focus trap, close on escape, etc., and no predefined or content
structure. Visually it's just a white/dark rectangle with backdrop and close button.
You should use `CustomDialog` only when you need to create a very custom dialog with custom content, structure, styles,
etc.

In most of the cases you should use `Dialog` component, as it's a wrapper around `CustomDialog` component.

## Using CustomDialog

For guidelines on how to use this component and the features it
offers, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [DesignSystem / Dialog Component](http://localhost:9001/?path=/docs/designsystem-dialog--docs).