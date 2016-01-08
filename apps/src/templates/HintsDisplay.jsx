module.exports = React.createClass({

  propTypes: {
    hintReviewTitle: React.PropTypes.string.isRequired,
    seenHints: React.PropTypes.array.isRequired,
    unseenHints: React.PropTypes.array.isRequired,
    onUserViewedHint: React.PropTypes.func.isRequired,
    lightbulbSVG: React.PropTypes.node.isRequired,
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
      seenHints = [
          <h1>{ this.props.hintReviewTitle }</h1>,
          <ul>
            {hintsToShow.map(function (hint) {
              return <li dangerouslySetInnerHTML={{ __html : hint.content }} style={{ marginBottom: '12px' }}/>;
            })}
          </ul>
      ];
    }

    var viewHintButton;
    if (!this.state.showNextUnseenHint && this.props.unseenHints && this.props.unseenHints.length) {
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
