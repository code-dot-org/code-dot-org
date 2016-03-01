var msg = require('../locale');
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
module.exports = React.createClass({

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

  /**
   * Many of our hints include Blockly blocks. Unfortunately, Blockly
   * BlockSpaces have a real problem with being created before they are
   * in the DOM, so we need to inject this BlockSpace outside of our
   * React render method once we're confident that this component is in
   * the DOM.
   */
  injectBlocklyHint: function (hint) {
    var ref = this.refs[hint.hintId];
    ref.injectBlocklyHint();
  },

  componentDidMount: function () {
    // now that we're in the DOM, we can render our Blockly blocks for
    // those hints that have them
    this.props.seenHints.filter(function (hint) {
      return hint.block;
    }).forEach(this.injectBlocklyHint);
  },

  componentDidUpdate: function () {
    // if our update has us showing a new hint, make sure to render the
    // block if it has one
    if (this.state.showNextUnseenHint && this.props.unseenHints[0].block) {
      this.injectBlocklyHint(this.props.unseenHints[0]);
    }
  },

  render: function () {
    var hintsToShow = this.props.seenHints;
    if (this.state.showNextUnseenHint) {
      hintsToShow = hintsToShow.concat(this.props.unseenHints[0]);
    }

    var seenHints;
    if (hintsToShow && hintsToShow.length) {
      seenHints = [
          <h1>
            <Lightbulb size={32} style={{ margin: "-9px 0 -9px -5px" }}/>
            { this.props.hintReviewTitle }
          </h1>,
          <ol>
            {hintsToShow.map(function (hint) {
              return <Hint hint={hint} ref={hint.hintId} />;
            })}
          </ol>
      ];
    }

    var viewHintButton;
    if (!this.state.showNextUnseenHint && this.props.unseenHints && this.props.unseenHints.length) {
      viewHintButton = (
        <button id="hint-button" onClick={ this.viewHint } className="lightbulb-button">
          <Lightbulb size={32} />
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
