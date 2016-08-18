import React from 'react';

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

  getInitialState: function () {
    return {
      height: 100,
      blockSpace: undefined
    };
  },

  componentDidUpdate: function () {
    if (this.state.blockSpace) {
      this.state.blockSpace.blockSpaceEditor.svgResize();
    }
  },

  componentDidMount: function () {
    if (!document.body.contains(this.refs.container)) {
      return new Error('ReadOnlyBlockSpace component MUST be rendered into a container that already exists in the DOM');
    }

    let blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(this.refs.container, this.props.block, {
      noScrolling: true
    });

    let metrics = blockSpace.getMetrics();
    let height = metrics.contentHeight + metrics.contentTop;

    // Setting state here will trigger an immediate re-render; however,
    // that is unavaoidable given that we cannot know what size our
    // blockspace is until it's already in the DOM
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      height,
      blockSpace
    });
  },

  render: function () {
    const style = {
      maxHeight: this.state.height,
      paddingBottom: 10
    };

    return (<div className="block-space" ref="container" style={style}/>);
  }
});

module.exports = ReadOnlyBlockSpace;
