import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import Toast, {DEFAULT_TOAST_DURATION, ToastProvider, useToast} from '../index';

export default {
  title: 'DesignSystem/Toast',
  component: Toast,
} as Meta<typeof Toast>;

type Story = StoryObj<typeof Toast>;

const SPINNER_ICON = {iconName: 'spinner', animationType: 'spin'} as const;

/**
 * The controlled Toast, rendered open with auto-dismiss disabled so it holds a
 * stable frame for visual regression. This is the escape hatch: you own `open`.
 */
export const Default: Story = {
  args: {
    open: true,
    message: 'Your changes have been saved.',
    type: 'success',
    autoHideDuration: null,
  },
};

/** Danger styling — the same surface the legacy FlashHandler used for alerts. */
export const Danger: Story = {
  args: {
    open: true,
    message: 'Something went wrong. Please try again.',
    type: 'danger',
    autoHideDuration: null,
  },
};

// useToast() must resolve against a ToastProvider, so the trigger sits inside
// its own provider rather than reading one from an outer scope.
function ImperativeDemo({autoHideDuration}: {autoHideDuration: number}) {
  return (
    <ToastProvider autoHideDuration={autoHideDuration}>
      <TriggerButton />
    </ToastProvider>
  );
}

function TriggerButton() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast('Profile updated')}>
      Show toast
    </button>
  );
}

/**
 * The imperative `useToast()` API. Click "Show toast" and watch it auto-dismiss
 * after `autoHideDuration` ms (defaults to the real 6s production default; lower
 * it in the Controls panel to watch it dismiss sooner). The play function shows
 * a toast and asserts it auto-dismisses. Excluded from Eyes (interaction+timer).
 */
export const ImperativeApi: StoryObj<{autoHideDuration: number}> = {
  args: {autoHideDuration: DEFAULT_TOAST_DURATION},
  render: ({autoHideDuration}) => (
    <ImperativeDemo autoHideDuration={autoHideDuration} />
  ),
  parameters: {
    eyes: {include: false},
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', {name: 'Show toast'}),
    );
    // The message is announced from the persistent live region (assertive
    // default → role="alert").
    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent('Profile updated'),
    );
    // ...and then auto-dismisses: the announcer clears and the Alert unmounts.
    await waitFor(
      () => {
        expect(canvas.getByRole('alert')).toHaveTextContent('');
        expect(canvas.queryByText('Profile updated')).toBeNull();
      },
      {timeout: args.autoHideDuration + 3_000},
    );
  },
};

/**
 * A custom icon replaces the one the `type` would pick.
 * Excluded from Eyes - a spinning icon never holds a stable frame.
 */
export const CustomIcon: Story = {
  args: {
    open: true,
    message: 'Saving to your backpack...',
    type: 'info',
    autoHideDuration: null,
    alertProps: {icon: SPINNER_ICON},
  },
  parameters: {
    eyes: {include: false},
  },
};

// A save that reports itself twice: in progress, then its result. The second
// toast replaces the first, so the icon is the thing that changes state.
function IconDemo() {
  const toast = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast('Saving to your backpack...', {
            type: 'info',
            autoHideDuration: null,
            icon: SPINNER_ICON,
          })
        }
      >
        Start saving
      </button>
      <button type="button" onClick={() => toast('Saved to your backpack')}>
        Finish saving
      </button>
    </>
  );
}

/**
 * The same custom icon through `useToast()`, where it is a `ShowToastOptions`
 * field rather than an Alert prop. Click "Start saving" for the spinner, then
 * "Finish saving" to replace it with the success toast and its default icon.
 * Excluded from Eyes (interaction + a spinning icon).
 */
export const ImperativeCustomIcon: StoryObj = {
  render: () => (
    <ToastProvider>
      <IconDemo />
    </ToastProvider>
  ),
  parameters: {
    eyes: {include: false},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // The dismiss button's icon shares this test id; the Alert's own comes
    // first in the DOM.
    const alertIcon = () => canvas.getAllByTestId('font-awesome-v6-icon')[0];

    await userEvent.click(
      await canvas.findByRole('button', {name: 'Start saving'}),
    );
    await waitFor(() => expect(alertIcon()).toHaveClass('fa-spinner'));

    await userEvent.click(
      await canvas.findByRole('button', {name: 'Finish saving'}),
    );
    // Dropping the option restores the icon the type picks.
    await waitFor(() => expect(alertIcon()).toHaveClass('fa-check-circle'));
  },
};
