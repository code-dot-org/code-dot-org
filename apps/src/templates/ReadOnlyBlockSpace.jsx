import React, { PropTypes } from 'react';

/**
  * Many of our hints include Blockly blocks. Unfortunately, Blockly
  * BlockSpaces have a real problem with being created before they are
  * in the DOM, so we need to inject this BlockSpace outside of our
  * React render method once we're confident that this component is in
  * the DOM.
  */
export default class ReadOnlyBlockSpace extends React.Component {
  static propTypes = {
    block: PropTypes.object.isRequired,
  };

  state = {
    height: 100,
    blockSpace: undefined,
  };

  componentDidMount() {
    if (!document.body.contains(this.container)) {
      return new Error('ReadOnlyBlockSpace component MUST be rendered into a container that already exists in the DOM');
    }

    let blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(this.container, this.props.block, {
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
      blockSpace,
    });
  }

  componentDidUpdate() {
    if (this.state.blockSpace) {
      this.state.blockSpace.blockSpaceEditor.svgResize();
    }
  }

  render() {
    const style = {
      maxHeight: this.state.height,
      paddingBottom: 10,
    };

    return (
      <div
        className="block-space"
        ref={(container) => { this.container = container; }}
        style={style}
      />
    );
  }
}
