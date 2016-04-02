/**
  * Many of our hints include Blockly blocks. Unfortunately, Blockly
  * BlockSpaces have a real problem with being created before they are
  * in the DOM, so we need to inject this BlockSpace outside of our
  * React render method once we're confident that this component is in
  * the DOM.
  */
var ReadOnlyBlockSpace = React.createClass({
  propTypes: {
    block: React.PropTypes.object.isRequired,
  },

  componentDidMount: function () {
    if (!document.body.contains(this.refs.container)) {
      return new Error('ReadOnlyBlockSpace component MUST be rendered into a container that already exists in the DOM');
    }
    Blockly.BlockSpace.createReadOnlyBlockSpace(this.refs.container, this.props.block);
  },

  render: function () {
    return (<div className="block-space" ref="container" style={{maxHeight: '100px'}}/>);
  }
});

module.exports = ReadOnlyBlockSpace;
