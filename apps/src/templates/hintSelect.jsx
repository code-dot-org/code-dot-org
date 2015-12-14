var msg = require('../locale');

module.exports = React.createClass({
  propTypes: {
    showInstructions: React.PropTypes.func.isRequired,
    showHint: React.PropTypes.func.isRequired
  },
  render: function () {
    return (
      <div>
        <h4>Need help?</h4>
        <a className='btn btn-link' onClick={this.props.showInstructions}>{msg.hintSelectInstructions()}</a>
        <a className='btn btn-link' onClick={this.props.showHint}>{msg.hintSelectNewHint()}</a>
      </div>
    );
  }
});
