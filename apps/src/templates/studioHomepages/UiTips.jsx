// UiTips: A small manager for showing UI tips, particularly for new or changed UI.
// Note that "triggered" tips (e.g. show a tip when the user clicks a certain
// DOM element) work on elements outside of the React DOM.  The current
// implementation is limited in that it expects a single instance of UiTips
// per page, and it expects that instance to live for the duration of the page.
// It doesn't do proper cleanup of the click handler for the non-React component
// if UiTips goes away.

import $ from 'jquery';
import React, {PropTypes} from 'react';
import UiTip from './UiTip';
import Dialog from '../Dialog';
import _ from 'lodash';
import styleConstants from '../../styleConstants';
import trackEvent from '../../util/trackEvent';

export default class UiTips extends React.Component {
  static propTypes = {
    userId: PropTypes.number,
    tipId: PropTypes.string,
    showInitialTips: PropTypes.bool,
    beforeDialog: PropTypes.object,
    afterDialog: PropTypes.object,
    tips: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    const tipsShowing = [];
    const showInitialTips = this.props.showInitialTips;

    // We might start by showing the "before" dialog.
    const showingDialog = (showInitialTips && this.props.beforeDialog) ? "before" : null;

    // If we want to show the initial tips but there is no dialog, show the initial tips immediately.
    if (showInitialTips && !showingDialog) {
      this.props.tips.forEach((tip, index) => {
        if (tip.type === "initial") {
          tipsShowing[index] = true;
        }
      });
    }

    this.state = {
      showInitialTips,
      tipsShowing,
      showingDialog,
      mobileWidth: $(window).width() <= styleConstants['content-width']
    };
  }

  closeClicked = (index) => {
    // Update state so it's no longer showing.
    const newTipsShowing = [...this.state.tipsShowing];
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
        $.post(
          `/api/v1/users/${this.props.userId}/post_ui_tip_dismissed`,
          { tip: this.props.tipId }
        );

        // Show a concluding dialog if there is one.
        if (this.props.afterDialog) {
          newState = {...newState, showingDialog: "after"};
        }

        // Don't show initial tips any more.
        newState = {...newState, showInitialTips: false};
      }
    }

    this.setState(newState);
  };

  afterDialogCancel = () => {
    this.setState({...this.state, showingDialog: null});

    trackEvent("ui_tips", this.props.tipId, "after_dialog_cancel");
  };

  afterDialogConfirm = () => {
    if (this.props.afterDialog.onConfirm.action === "url") {
      window.open(this.props.afterDialog.onConfirm.url, "_blank");
    }
    this.setState({...this.state, showingDialog: null});

    trackEvent("ui_tips", this.props.tipId, "after_dialog_confirm");
  };

  beforeDialogCancel = () => {
    this.setState({...this.state, showInitialTips: false, showingDialog: null});

    $.post(
      `/api/v1/users/${this.props.userId}/post_ui_tip_dismissed`,
      { tip: this.props.tipId }
    );

    trackEvent("ui_tips", this.props.tipId, "before_dialog_cancel");
  };

  beforeDialogConfirm = () => {
    const tipsShowing = [];

    if (this.state.showInitialTips) {
      this.props.tips.forEach((tip, index) => {
        if (tip.type === "initial") {
          tipsShowing[index] = true;
        }
      });
    }

    this.setState({...this.state, tipsShowing: tipsShowing, showingDialog: null});

    trackEvent("ui_tips", this.props.tipId, "before_dialog_confirm");
  };

  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.onResize, 100));

    // For each triggered tip, just use jquery to set up an onClick handler
    // that will call back into us and set state to show that tip.
    this.props.tips.forEach((tip, index) => {
      if (tip.type === "triggered") {
        $(`#${tip.triggerId}`).click(e => {
          if (!this.state.showInitialTips) {
            let newTipsShowing = [...this.state.tipsShowing];
            newTipsShowing[index] = true;
            const newState = {...this.state, tipsShowing: newTipsShowing};
            this.setState(newState);
          }
          e.preventDefault();
        });
      }
    });
  }

  onResize = () => {
    this.setState({mobileWidth: $(window).width() <= styleConstants['content-width']});
  };

  render() {
    const { tips } = this.props;

    if (this.state.mobileWidth) {
      return (
        <div/>
      );
    }

    return (
      <div>
        {tips.map((tip, index) => (
          (this.state.tipsShowing[index] && (
            <UiTip
              key = {index}
              index = {index}
              position = {tip.position}
              text = {tip.text}
              arrowDirection={tip.arrowDirection}
              closeClicked={this.closeClicked}
            />
          )
        )))}

        {this.props.beforeDialog && (
          <Dialog
            isOpen={this.state.showingDialog === "before"}
            title={this.props.beforeDialog.title}
            body={this.props.beforeDialog.body}
            confirmText={this.props.beforeDialog.confirm}
            cancelText={this.props.beforeDialog.cancel}
            onCancel={this.beforeDialogCancel}
            handleClose={this.beforeDialogCancel}
            onConfirm={this.beforeDialogConfirm}
          />
        )}

        {this.props.afterDialog && (
          <Dialog
            isOpen={this.state.showingDialog === "after"}
            title={this.props.afterDialog.title}
            body={this.props.afterDialog.body}
            confirmText={this.props.afterDialog.confirm}
            cancelText={this.props.afterDialog.cancel}
            onCancel={this.afterDialogCancel}
            handleClose={this.afterDialogCancel}
            onConfirm={this.afterDialogConfirm}
          />
        )}
      </div>
    );
  }
}
