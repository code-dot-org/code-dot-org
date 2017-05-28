import React from 'react';
import UiTip from './UiTip';

const UiTips = React.createClass({
  propTypes: {
    tips: React.PropTypes.array
  },

  getInitialState() {
    let tipsShowing = [];
    this.props.tips.map((tip, index) => (
      tipsShowing[index] = true
    ));

    return {
      tipsShowing: tipsShowing
    };
  },

  closeClicked(index) {
    // Tell the server to update the user so that this one's marked as seen.
    var form = $("#homepage_ui_tips_form");
    $.ajax({
      type: 'POST',
      url: form.attr('action'),
      data: form.serialize(),
      dataType: 'json',
      complete: function (data) {}
    });

    // Update state so it's no longer showing.
    let newTipsShowing = { ...this.state.tipsShowing};
    newTipsShowing[index] = false;
    let newState = {...this.state, tipsShowing: newTipsShowing};
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
      </div>
    );
  }
});

export default UiTips;
