import PropTypes from 'prop-types';
import React from 'react';

/**
 * Many of our hints include Blockly blocks. Unfortunately, Blockly
 * workspace have a real problem with being created before they are
 * in the DOM, so we need to inject this workspace outside of our
 * React render method once we're confident that this component is in
 * the DOM.
 */
export default class EmbeddedWorkspace extends React.Component {
  static propTypes = {
    block: PropTypes.object.isRequired,
    isRtl: PropTypes.bool,
  };

  state = {
    height: 100,
    workspace: undefined,
  };

  componentDidMount() {
    if (!document.body.contains(this.container)) {
      return new Error(
        'EmbeddedWorkspace component MUST be rendered into a container that already exists in the DOM'
      );
    }

    let workspace = Blockly.createEmbeddedWorkspace(
      this.container,
      this.props.block,
      {
        noScrolling: true,
        rtl: this.props.isRtl,
      }
    );

    let metrics = workspace.getMetrics();
    let height = metrics.contentHeight + metrics.contentTop;

    // Setting state here will trigger an immediate re-render; however,
    // that is unavaoidable given that we cannot know what size our
    // workspace is until it's already in the DOM
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      height,
      workspace,
    });
  }

  componentDidUpdate() {
    if (this.state.workspace) {
      Blockly.cdoUtils.workspaceSvgResize(this.state.workspace);
    }
  }

  render() {
    const style = {
      maxHeight: this.state.height,
      paddingBottom: 10,
      overflow: 'hidden',
    };

    return (
      <div
        className="block-space"
        ref={container => {
          this.container = container;
        }}
        style={style}
      />
    );
  }
}
