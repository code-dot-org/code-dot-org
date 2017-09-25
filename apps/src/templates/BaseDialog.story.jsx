import React from 'react';
import BaseDialog from './BaseDialog';

var ExampleDialogButton = React.createClass({
  render() {
    return (
      <div>
        <BaseDialog
          isOpen={!!this.state && this.state.open}
          handleClose={() => this.setState({open: false})}
          {...this.props}
        >
          <div style={{border: '1px solid black'}}>
            The contents of the dialog go inside this box! woo
          </div>
        </BaseDialog>
        <button onClick={() => this.setState({open: true})}>
          Open the example dialog
        </button>
      </div>
    );
  }
});

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
        story: () => <ExampleDialogButton />
      }, {
        name: 'fullWidth',
        story: () => <ExampleDialogButton fullWidth/>
      }, {
        name: 'fixedWidth',
        story: () => (
          <ExampleDialogButton
            useUpdatedStyles
            fixedWidth={300}
            assetUrl={url => '/blockly/' + url}
          />
        )
      }, {
        name: 'fixedHeight',
        story: () => (
          <ExampleDialogButton
            useUpdatedStyles
            fixedHeight={400}
            assetUrl={url => '/blockly/' + url}
          />
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
