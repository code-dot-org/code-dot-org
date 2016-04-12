var msg = require('../locale');

var CompletionButton = require('./CompletionButton');

var styles = {
  hidden: {
    display: 'none'
  }
};

var GameButtons = React.createClass({
  propTypes: {
    buttonImageUrl: React.PropTypes.string.isRequired,
    isProjectLevel: React.PropTypes.bool.isRequired,
    isSubmittable: React.PropTypes.bool.isRequired,
    isSubmitted: React.PropTypes.bool.isRequired,
  },

  render: function () {
    return (
      <div id="gameButtons">
        <button id="runButton" className="launch blocklyLaunch">
          <div>{msg.runProgram()}</div>
          <img src={this.props.buttonImageUrl} className="run26"/>
        </button>
        <button id="resetButton" className="launch blocklyLaunch" style={styles.hidden}>
          <div>{msg.resetProgram()}</div>
          <img src={this.props.buttonImageUrl} className="reset26"/>
        </button>
        {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <CompletionButton
            buttonImageUrl={this.props.buttonImageUrl}
            isProjectLevel={this.props.isProjectLevel}
            isSubmittable={this.props.isSubmittable}
            isSubmitted={this.props.isSubmitted}
        />
      </div>
    );
  }
});

module.exports = GameButtons;
