var msg = require('../../locale');

var HintSelect = React.createClass({
  propTypes: {
    showInstructions: React.PropTypes.func.isRequired,
    showHint: React.PropTypes.func.isRequired
  },
  render: function () {
    return (
      <div>
        <h4>{msg.hintPrompt()}</h4>
        <a className='btn btn-link show-instructions' onClick={this.props.showInstructions}>{msg.hintSelectInstructions()}</a>
        <a className='btn btn-link show-hint' onClick={this.props.showHint}>{msg.hintSelectNewHint()}</a>
      </div>
    );
  }
});
module.exports = HintSelect;
