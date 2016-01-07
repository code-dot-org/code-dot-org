module.exports = React.createClass({

  propTypes: {
    hintReviewTitle: React.PropTypes.string.isRequired,
    getSeenHints: React.PropTypes.func.isRequired,
    getUnseenHints: React.PropTypes.func.isRequired,
    recordUserViewedHint: React.PropTypes.func.isRequired,
    lightbulbSVG: React.PropTypes.node.isRequired,
  },

  getInitialState: function () {
    return {
      seenHints: this.props.getSeenHints(),
      unseenHints: this.props.getUnseenHints(),
      showViewHintButton: true
    };
  },

  viewHint: function () {
    this.props.recordUserViewedHint(this.state.unseenHints[0]);
    var newState = this.getInitialState();
    newState.showViewHintButton = false;
    this.setState(newState);
  },

  render: function () {

    var seenHints;
    if (this.state.seenHints && this.state.seenHints.length) {
      seenHints = [
          <h1>{ this.props.hintReviewTitle }</h1>,
          <ul>
            {this.state.seenHints.map(function (hint) {
              return <li dangerouslySetInnerHTML={{ __html : hint.content }} style={{ marginBottom: '12px' }}/>;
            })}
          </ul>
      ];
    }

    var viewHintButton;
    if (this.state.showViewHintButton && this.state.unseenHints && this.state.unseenHints.length) {
      viewHintButton = (
        <button id="hint-button" onClick={ this.viewHint }>
          <span dangerouslySetInnerHTML={{ __html: this.props.lightbulbSVG }} />
          Get a new hint
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
