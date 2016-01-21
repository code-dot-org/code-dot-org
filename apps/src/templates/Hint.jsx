module.exports = React.createClass({

  propTypes: {
    hint: React.PropTypes.objectisRequired
  },

  render: function () {
    var hintBlock;
    if (this.props.hint.block) {
      hintBlock = (<div className="block-hint" id={ this.props.hint.hintId } style={{ maxHeight: '100px' }} />);
    }
    return (<li style={{ marginBottom: '12px' }}>
      <div dangerouslySetInnerHTML={{ __html : this.props.hint.content }} />
      {hintBlock}
    </li>);
  },
});

