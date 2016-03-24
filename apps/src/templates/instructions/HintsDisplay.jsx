var msg = require('../../locale');
var Hint = require('./Hint.jsx');
var Lightbulb = require('./Lightbulb.jsx');

/**
 * @overview React Component for displaying Authored Hints in the
 * Instructions dialog. Any hints the user has already requested to see
 * are listed, along with a button to see the next hint.
 * Pressing the button adds the next hint (or the first hint if none
 * have previously been viewed) to the list of hints and removes the
 * button.
 * Closing the instructions and re-opening them will reset this
 * Component, allowing the button to be pressed once more.
 */
var HintsDisplay = React.createClass({

  propTypes: {
    hintReviewTitle: React.PropTypes.string.isRequired,
    seenHints: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    unseenHints: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onUserViewedHint: React.PropTypes.func.isRequired,
  },

  getInitialState: function () {
    return {
      showNextUnseenHint: false
    };
  },

  viewHint: function () {
    this.props.onUserViewedHint();
    this.setState({
      showNextUnseenHint: true
    });
  },

  render: function () {
    var hintsToShow = this.props.seenHints;
    if (this.state.showNextUnseenHint) {
      hintsToShow = hintsToShow.concat(this.props.unseenHints[0]);
    }

    var seenHints;
    if (hintsToShow && hintsToShow.length) {
      seenHints = (<div>
        <h1>
          <Lightbulb size={32} style={{ margin: "-9px 9px -9px -5px" }}/>
          { this.props.hintReviewTitle }
        </h1>
        <ol>
          {hintsToShow.map(function (hint) {
            return <Hint hint={hint} key={hint.hintId} ref={hint.hintId} />;
          })}
        </ol>
      </div>);
    }

    var viewHintButton;
    if (!this.state.showNextUnseenHint && this.props.unseenHints && this.props.unseenHints.length) {
      viewHintButton = (
        <button id="hint-button" onClick={ this.viewHint } className="lightbulb-button">
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
