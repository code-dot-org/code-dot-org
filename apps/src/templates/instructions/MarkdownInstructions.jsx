/* eslint-disable react/no-danger */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import { connect } from 'react-redux';
import { convertXmlToBlockly } from './utils';

var styles = {
  standard: {
    marginBottom: 35,
    paddingTop: 19
  },
  inTopPane: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 0
  },
  inTopPaneCanCollapse: {
    marginTop: 0,
    marginBottom: 0,
  },
  inTopPaneWithImage: {
    minHeight: 300
  }
};

const MarkdownInstructions = React.createClass({
  propTypes: {
    renderedMarkdown: React.PropTypes.string.isRequired,
    noInstructionsWhenCollapsed: React.PropTypes.bool.isRequired,
    hasInlineImages: React.PropTypes.bool,
    onResize: React.PropTypes.func,
    inTopPane: React.PropTypes.bool,
    isBlockly: React.PropTypes.bool
  },

  /**
   * Attach any necessary jQuery to our markdown
   */
  configureMarkdown_() {
    if (!this.props.onResize) {
      return;
    }

    // If we have the jQuery details plugin, enable its usage on any details
    // elements
    const detailsDOM = $(ReactDOM.findDOMNode(this)).find('details');
    if (detailsDOM.details) {
      detailsDOM.details();
      detailsDOM.on({
        'toggle.details.TopInstructions': () => {
          this.props.onResize();
        }
      });
    }

    if (this.props.isBlockly) {
      // Convert any inline XML into blockly blocks. Note that we want to
      // make sure we don't initialize any blockspace before the main
      // block space has been created, lest we violate some assumptions
      // blockly has.
      Blockly.BlockSpace.onMainBlockSpaceCreated(() => {
        convertXmlToBlockly(ReactDOM.findDOMNode(this));
        this.props.onResize();
      });
    }

    // Parent needs to readjust some sizing after images have loaded
    $(ReactDOM.findDOMNode(this)).find('img').load(this.props.onResize);
  },

  componentDidMount() {
    this.configureMarkdown_();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.renderedMarkdown !== this.props.renderedMarkdown) {
      this.configureMarkdown_();
    }
  },

  componentWillUnmount() {
    const detailsDOM = $(ReactDOM.findDOMNode(this)).find('details');
    if (detailsDOM.details) {
      detailsDOM.off('toggle.details.TopInstructions');
    }
  },

  render() {
    const {
      inTopPane,
      renderedMarkdown,
    } = this.props;

    // In cases where we have a full-size image (as opposed to the inline images we use in
    // Star Wars), we want to guarantee a certain amount of height, to deal with the fact
    // that we won't know how much height the image actually needs until it has loaded
    const hasFullSizeImage = !this.props.hasInlineImages && /<img src/.test(renderedMarkdown);

    const canCollapse = !this.props.noInstructionsWhenCollapsed;
    return (
      <div
        className="instructions-markdown"
        style={[
          styles.standard,
          inTopPane && styles.inTopPane,
          inTopPane && hasFullSizeImage && styles.inTopPaneWithImage,
          inTopPane && canCollapse && styles.inTopPaneCanCollapse
        ]}
        dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
      />
    );
  }
});

export const StatelessMarkdownInstructions = Radium(MarkdownInstructions);
export default connect(state => ({
  hasInlineImages: state.instructions.hasInlineImages,
  isBlockly: state.pageConstants.isBlockly,
  noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
}))(Radium(MarkdownInstructions));
