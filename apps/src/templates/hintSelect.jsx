module.exports = React.createClass({
  propTypes: {
    showInstructions: React.PropTypes.func.isRequired,
    showHint: React.PropTypes.func.isRequired
  },
  render: function () {
    return (
      <div>
        <h4>Need help?</h4>
        <a className='btn btn-link' onClick={this.props.showInstructions}>Instructions and old hints</a>
        <a className='btn btn-link' onClick={this.props.showHint}>Get a new hint</a>
      </div>
    );
  }
});
