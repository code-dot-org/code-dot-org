import React from 'react';
import BaseDialog from './BaseDialog';
import ExampleDialogButton from '../util/ExampleDialogButton';

const EXAMPLE_DIALOG_BODY = (
  <div style={{border: '1px solid black'}}>
    The contents of the dialog go inside this box! woo
  </div>
);

export default storybook => {
  return storybook
    .storiesOf('BaseDialog', module)
    .addStoryTable([
      {
        name:'hiding the backdrop',
        description: `This is useful for debugging/developing dialogs
                        without having to constantly click to open it.`,
        story: () => (
          <BaseDialog hideBackdrop={true}>
            This is the dialog content!
          </BaseDialog>
        )
      }, {
        name: 'click to open',
        story: () => (
          <ExampleDialogButton>
            <BaseDialog>
              {EXAMPLE_DIALOG_BODY}
            </BaseDialog>
          </ExampleDialogButton>
        )
      }, {
        name: 'fullWidth',
        story: () => (
          <ExampleDialogButton>
            <BaseDialog fullWidth>
              {EXAMPLE_DIALOG_BODY}
            </BaseDialog>
          </ExampleDialogButton>
        )
      }, {
        name: 'fixedWidth',
        story: () => (
          <ExampleDialogButton>
            <BaseDialog
              useUpdatedStyles
              fixedWidth={300}
            >
              {EXAMPLE_DIALOG_BODY}
            </BaseDialog>
          </ExampleDialogButton>
        )
      }, {
        name: 'fixedHeight',
        story: () => (
          <ExampleDialogButton>
            <BaseDialog
              useUpdatedStyles
              fixedHeight={400}
            >
              {EXAMPLE_DIALOG_BODY}
            </BaseDialog>
          </ExampleDialogButton>
        )
      }, {
        name: 'old style',
        description: `Dialogs with the useDeprecatedGlobalStyles flag
                        rely on global css. Don't do this.`,
        story: () => (
          <BaseDialog hideBackdrop={true} useDeprecatedGlobalStyles>
            <div className="modal-content no-modal-icon">
              <p className="dialog-title">Titles go in p.dialog-title tags?!?!?</p>
              Wrap dialog content inside a
              {' '}<code>{'<div class="model-content no-modal-icon"/>'}</code>{' '}
              because this component won't do that for you...
            </div>
          </BaseDialog>
        )
      }
    ]);
};
