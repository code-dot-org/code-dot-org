import React from 'react';
import Radium from 'radium';
import Dialog from '../../templates/Dialog';

export const ConfirmDeleteButton = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string.isRequired,
    confirmText: React.PropTypes.string,
    onConfirm: React.PropTypes.func.isRequired,

  },

  getInitialState() {
    return {
      open: false
    };
  },

  handleClose() {
    this.setState({open: false});
  },

  handleConfirm() {
    this.setState({open: false});
    this.props.onConfirm();
  },

  render() {
    let {confirmText, onConfirm, ...otherProps} = this.props;
    confirmText = confirmText || "Delete";
    return (
      <div>
        <Dialog
          cancelText="Cancel"
          confirmText={confirmText}
          confirmType="danger"
          isOpen={!!this.state && this.state.open}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirm}
          {...otherProps}
        />
        <button onClick={() => this.setState({open: true})}>
          {this.props.buttonText}
        </button>
      </div>
    );
  }
});

if (BUILD_STYLEGUIDE) {
  ConfirmDeleteButton.styleGuideExamples = storybook => {
    return storybook
      .storiesOf('ConfirmDeleteButton', module)
      .addStoryTable([
        {
          name: 'basic example',
          description: ``,
          story: () => (
            <ConfirmDeleteButton
              title="Delete table?"
              body="Are you sure you want to delete the table?"
              buttonText="Delete table"
              onConfirm={storybook.action("delete table")}
            />
          )
        }]);
  };
}
