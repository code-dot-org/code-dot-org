import React from 'react';
import UiTip from './UiTip';
import Dialog from '../Dialog';

const UiTips = React.createClass({
  propTypes: {
    formId: React.PropTypes.string,
    tips: React.PropTypes.array,
    beforeDialog: React.Protypes.object,
    afterDialog: React.PropTypes.object
  },

  getInitialState() {
    let tipsShowing = [];

    let showInitialTips = true;  // Unless user object notes they've seen them already

    // We might start by showing the "before" dialog.
    const showingDialog = (showInitialTips && this.props.beforeDialog) ? "before" : null;

    // If we want to show the initla tips but there is no dialog, show the initial tips immediately.
    if (showInitialTips && !showingDialog) {
      this.props.tips.map((tip, index) => {
        if (tip.type === "initial") {
          tipsShowing[index] = true;
        }
      });
    }

    return {
      showInitialTips: showInitialTips,
      tipsShowing: tipsShowing,
      showingDialog: showingDialog
    };
  },

  closeClicked(index) {
    // Update state so it's no longer showing.
    let newTipsShowing = [...this.state.tipsShowing];
    newTipsShowing[index] = false;
    let newState = {...this.state, tipsShowing: newTipsShowing};

    // Once all the initial tips are dismissed, tell the server to update the user
    // so it's recorded.
    if (this.state.showInitialTips) {
      let tipRemaining = false;
      newState.tipsShowing.forEach(tipShowing => {
        if (tipShowing) {
          tipRemaining = true;
        }
      });

      if (!tipRemaining) {
        // Modify the user object to no longer show this.
        let form = $(`#${this.props.formId}`);
        $.ajax({
          type: 'POST',
          url: form.attr('action'),
          data: form.serialize(),
          dataType: 'json',
          complete: function (data) {}
        });

        // Show a concluding dialog if there is one.
        if (this.props.afterDialog) {
          newState = {...newState, showingDialog: "after"};
        }

        // Don't show initial tips any more.
        newState = {...newState, showInitialTips: false};
      }
    }

    this.setState(newState);
  },

  afterDialogCancel() {
    let newState = {...this.state, showingDialog: null};
    this.setState(newState);
  },

  afterDialogConfirm() {
    if (this.props.afterDialog.onConfirm.action === "url") {
      window.location = this.props.afterDialog.onConfirm.url;
    }
  },

  beforeDialogCancel() {
    let newState = {...newState, showInitialTips: false, showingDialog: null};
    this.setState(newState);

    // todo: write to user that we don't want to see initial tips any more.
  },

  beforeDialogConfirm() {
    let tipsShowing = [];

    if (this.state.showInitialTips) {
      this.props.tips.map((tip, index) => {
        if (tip.type === "initial") {
          tipsShowing[index] = true;
        }
      });
    }

    let newState = {...this.state, tipsShowing: tipsShowing, showingDialog: null};
    this.setState(newState);
  },

  render() {
    const { tips } = this.props;

    return (
      <div>
        {tips.map((tip, index) => (
          (this.state.tipsShowing[index] && (
            <UiTip
              key = {index}
              index = {index}
              position = {tip.position}
              text = {tip.text}
              closeClicked={this.closeClicked}
            />
          )
        )))}

        <Dialog
          isOpen={this.state.showingDialog === "before"}
          title={this.props.beforeDialog.title}
          body={this.props.beforeDialog.body}
          confirmText={this.props.beforeDialog.confirm}
          cancelText={this.props.beforeDialog.cancel}
          onCancel={this.beforeDialogCancel}
          onConfirm={this.beforeDialogConfirm}
        />

        <Dialog
          isOpen={this.state.showingDialog === "after"}
          title={this.props.afterDialog.title}
          body={this.props.afterDialog.body}
          confirmText={this.props.afterDialog.confirm}
          cancelText={this.props.afterDialog.cancel}
          onCancel={this.afterDialogCancel}
          onConfirm={this.afterDialogConfirm}
        />

      </div>
    );
  }
});

export default UiTips;
