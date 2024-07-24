import {userEvent, within, expect} from '@storybook/test';
import React from 'react';

import ExampleDialogButton from '../util/ExampleDialogButton';

import BaseDialog from './BaseDialog';

const EXAMPLE_DIALOG_BODY = (
  <div style={{border: '1px solid black'}}>
    The contents of the dialog go inside this box! woo
  </div>
);

// There isn't a clear abstraction for a template, so each is built separately
export default {
  component: BaseDialog,
};

export const HidingTheBackdrop = () => (
  <BaseDialog hideBackdrop={true}>This is the dialog content!</BaseDialog>
);

export const CalickToOpen = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(
      canvas.getByText(
        'Everything is perfect. Your account is ready and we should probably get you started!'
      )
    ).toBeInTheDocument();
  },
  render: () => (
    <ExampleDialogButton>
      <BaseDialog>{EXAMPLE_DIALOG_BODY}</BaseDialog>
    </ExampleDialogButton>
  ),
};

export const FullWidth = () => (
  <ExampleDialogButton>
    <BaseDialog fullWidth>{EXAMPLE_DIALOG_BODY}</BaseDialog>
  </ExampleDialogButton>
);

export const FixedWidth = () => (
  <ExampleDialogButton>
    <BaseDialog useUpdatedStyles fixedWidth={300}>
      {EXAMPLE_DIALOG_BODY}
    </BaseDialog>
  </ExampleDialogButton>
);

export const FixedHeight = () => (
  <ExampleDialogButton>
    <BaseDialog useUpdatedStyles fixedHeight={400}>
      {EXAMPLE_DIALOG_BODY}
    </BaseDialog>
  </ExampleDialogButton>
);
