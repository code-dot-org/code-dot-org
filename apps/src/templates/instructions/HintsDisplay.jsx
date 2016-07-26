var React = require('react');
var msg = require('@cdo/locale');
var Hint = require('./Hint');
var Lightbulb = require('../Lightbulb');

/**
 * @overview React Component for displaying Authored Hints in the
 * Instructions dialog. Any hints the user has already requested to see
 * are listed, along with a button to see the next hint.
 * Pressing the button closes the Instructions dialog and triggers the
 * next hint to be displayed in a qtip dialog
 */
var HintsDisplay = React.createClass({

  propTypes: {
    hintReviewTitle: React.PropTypes.string.isRequired,
    seenHints: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    unseenHints: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    viewHint: React.PropTypes.func.isRequired,
  },

  render: function () {
    var hintsToShow = this.props.seenHints;

    var seenHints;
    if (hintsToShow && hintsToShow.length) {
      seenHints = (<div>
        <h1>
          <Lightbulb size={32} style={{ margin: "-9px 9px -9px -5px" }}/>
          {this.props.hintReviewTitle}
        </h1>
        <ol>
          {hintsToShow.map(function (hint) {
            return <Hint hint={hint} key={hint.hintId} ref={hint.hintId} />;
          })}
        </ol>
      </div>);
    }

    var viewHintButton;
    if (this.props.unseenHints && this.props.unseenHints.length) {
      viewHintButton = (
        <button id="hint-button" onClick={this.props.viewHint} className="lightbulb-button">
          <Lightbulb size={32} style={{ margin: "-9px 0px -9px -5px" }}/>
          {msg.hintSelectNewHint()}
        </button>
      );
    }

    return (
      <div className="authored-hints">
      {seenHints}
      {viewHintButton}
      </div>
    );
  }
});

module.exports = HintsDisplay;
