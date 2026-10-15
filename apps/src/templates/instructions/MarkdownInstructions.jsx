import {extensions} from '@code-dot-org/markdown';
import $ from 'jquery';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {openDialog} from '@cdo/apps/redux/instructionsDialog';

import EnhancedSafeMarkdown from '../EnhancedSafeMarkdown';
import BlocklyMarkdown from '../markdown/BlocklyMarkdown';

import moduleStyles from './markdownInstructions.module.css';

class MarkdownInstructions extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    noInstructionsWhenCollapsed: PropTypes.bool,
    onResize: PropTypes.func,
    inTopPane: PropTypes.bool,
    isBlockly: PropTypes.bool,
    // From redux.
    isRtl: PropTypes.bool,
    openImageDialog: PropTypes.func.isRequired,
  };

  static defaultProps = {
    noInstructionsWhenCollapsed: false,
  };

  constructor(props) {
    super(props);

    // Parity with the EnhancedSafeMarkdown path, which always renders with
    // expandable images. `openImageDialog` is a stable bound dispatcher, so this
    // array reference is stable across renders and BlocklyMarkdown can memoize
    // its processor.
    this.blocklyExtensions = [
      extensions.expandableImages({
        onExpand: props.openImageDialog,
        className: moduleStyles.expandableImage,
      }),
      extensions.lenientHeadings,
      extensions.visualCodeBlock,
      extensions.inlineStyles,
      extensions.details,
    ];

    // Fire the parent resize once embedded blocks have (asynchronously) built.
    this.handleWorkspaceRender = () => this.props.onResize?.();

    // Hold embedded workspace creation until the main block space exists, lest
    // we violate Blockly's assumption that the main workspace comes first — the
    // same gate the legacy imperative convertXmlToBlockly path used.
    this.deferWorkspaceCreation = create =>
      Blockly.BlockSpace.onMainBlockSpaceCreated(create);
  }

  componentDidMount() {
    this.configureMarkdown_();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markdown !== this.props.markdown) {
      this.configureMarkdown_();
    }
  }

  /**
   * Attach any necessary jQuery to our markdown. Blockly blocks are rendered by
   * BlocklyMarkdown (React), so unlike the legacy path this no longer scans the
   * DOM for inline XML.
   */
  configureMarkdown_() {
    if (!this.props.onResize) {
      return;
    }

    const thisNode = ReactDOM.findDOMNode(this);

    thisNode.querySelectorAll('details').forEach(details => {
      details.addEventListener('toggle', this.props.onResize);
    });

    // Parent needs to readjust some sizing after images have loaded
    $(thisNode).find('img').load(this.props.onResize);
  }

  render() {
    const {inTopPane, markdown, isBlockly, isRtl} = this.props;

    const canCollapse = !this.props.noInstructionsWhenCollapsed;
    return (
      <div
        className="instructions-markdown"
        style={[
          styles.standard,
          inTopPane && styles.inTopPane,
          inTopPane && canCollapse && styles.inTopPaneCanCollapse,
        ]}
      >
        {isBlockly ? (
          <BlocklyMarkdown
            content={markdown}
            isRtl={isRtl}
            extensions={this.blocklyExtensions}
            onWorkspaceRender={this.handleWorkspaceRender}
            deferWorkspaceCreation={this.deferWorkspaceCreation}
          />
        ) : (
          <EnhancedSafeMarkdown markdown={markdown} expandableImages />
        )}
      </div>
    );
  }
}

const styles = {
  standard: {
    marginBottom: 35,
    paddingTop: 19,
  },
  inTopPane: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 0,
  },
  inTopPaneCanCollapse: {
    marginTop: 0,
    marginBottom: 0,
  },
};

export const UnconnectedMarkdownInstructions = Radium(MarkdownInstructions);

export default connect(
  state => ({
    isRtl: state.isRtl,
  }),
  dispatch => ({
    openImageDialog(imgUrl, imgAlt) {
      dispatch(openDialog({imgOnly: true, imgUrl, imgAlt}));
    },
  })
)(UnconnectedMarkdownInstructions);
