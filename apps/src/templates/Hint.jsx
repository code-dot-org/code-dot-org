module.exports = React.createClass({

  propTypes: {
    hint: React.PropTypes.objectisRequired
  },

  renderBlocklyHint: function () {
    var node = React.findDOMNode(this.refs.hintBlock);
    // Only render if the node exists in the DOM
    if (node && document.contains(node)) {
      Blockly.BlockSpace.createReadOnlyBlockSpace(node, this.props.hint.block);
    }
  },

  render: function () {
    var hintBlock;
    if (this.props.hint.block) {
      hintBlock = (<div className="block-hint" ref="hintBlock" id={ this.props.hint.hintId } style={{ maxHeight: '100px' }} />);
    }
    return (<li style={{ marginBottom: '12px' }}>
      <div dangerouslySetInnerHTML={{ __html : this.props.hint.content }} />
      {hintBlock}
    </li>);
  },
});

