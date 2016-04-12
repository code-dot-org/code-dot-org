var msg = require('../locale');

var CompletionButton = require('./CompletionButton');

var styles = {
  hidden: {
    display: 'none'
  }
};

var GameButtons = React.createClass({
  propTypes: {
    imgUrl: React.PropTypes.string.isRequired,
    projectLevel: React.PropTypes.bool.isRequired,
    submittable: React.PropTypes.bool.isRequired,
    submitted: React.PropTypes.bool.isRequired,
  },

  render: function () {
    return (
      <div id="gameButtons">
        <button id="runButton" className="launch blocklyLaunch">
          <div>{msg.runProgram()}</div>
          <img src={this.props.imgUrl} className="run26"/>
        </button>
        <button id="resetButton" className="launch blocklyLaunch" style={styles.hidden}>
          <div>{msg.resetProgram()}</div>
          <img src={this.props.imgUrl} className="reset26"/>
        </button>
        {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <CompletionButton
            imgUrl={this.props.imgUrl}
            projectLevel={this.props.projectLevel}
            submittable={this.props.submittable}
            submitted={this.props.submitted}
        />
      </div>
    );
  }
});

module.exports = GameButtons;
