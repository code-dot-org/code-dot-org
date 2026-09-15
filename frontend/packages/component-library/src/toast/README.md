# `componentLibrary/toast`

A transient status message: a top-center MUI
[Snackbar](https://mui.com/material-ui/react-snackbar/) wrapping the design
system's [`Alert`](../alert/README.md), with a persistent live region so the
message is announced reliably by screen readers.

## Consuming This Component

Three composable pieces, from high- to low-level:

- `ToastProvider` + `useToast()` — mount the provider once near the app root;
  call the `show(message, options?)` function returned by `useToast()` to raise a
  toast imperatively. `show` no-ops outside a provider, so a component using it
  renders fine standalone (e.g. in tests).
- `Toast` (default export) — the controlled surface. You own `open`; useful when
  the toast state lives in your own component.
- `ToastAnnouncer` — just the always-mounted live region, if you drive the
  visual toast yourself and only need the announcement.

```jsx
import {ToastProvider, useToast} from '@code-dot-org/component-library/toast';

function App() {
  return (
    <ToastProvider>
      <Profile />
    </ToastProvider>
  );
}

function Profile() {
  const toast = useToast();
  return <button onClick={() => toast('Saved!')}>Save</button>;
}
```

Auto-dismiss defaults to 6 seconds; pass `autoHideDuration={null}` (on the
provider or a single `show` call) to keep a toast until it is closed.

The announcer is `assertive` by default (`role="alert"`). This is deliberate:
Orca, the Linux/AT-SPI screen reader, routinely drops a polite `role="status"`
region for this pattern, and an announcement that never happens is worse than
one that interrupts. Pass `politeness="polite"` (on `Toast` or `ToastProvider`)
only for an audience you've verified honors it.

For guidelines and live examples, run Storybook locally and go to
`DesignSystem / Toast`.
