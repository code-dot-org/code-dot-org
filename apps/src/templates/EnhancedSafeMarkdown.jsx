import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {openDialog} from '@cdo/apps/redux/instructionsDialog';

import SafeMarkdown from './SafeMarkdown';
import {renderExpandableImages} from './utils/expandableImages';

export class UnconnectedExpandableImagesWrapper extends React.Component {
  static propTypes = {
    showImageDialog: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  };

  componentDidMount() {
    this.postRenderHook();
  }

  componentDidUpdate(prevProps) {
    // TODO: do we need to do any kind of cleanup here? Or otherwise do
    // something more precise than calling the method again when we're
    // responding to an update rather than an initial render?
    this.postRenderHook();
  }

  postRenderHook() {
    const thisNode = ReactDOM.findDOMNode(this);
    renderExpandableImages(thisNode, this.props.showImageDialog);
  }

  render() {
    return this.props.children;
  }
}

export const ExpandableImagesWrapper = connect(null, dispatch => ({
  showImageDialog(imgUrl) {
    dispatch(
      openDialog({
        imgOnly: true,
        imgUrl,
      })
    );
  },
}))(UnconnectedExpandableImagesWrapper);

// Clickable text can be added via markdown instructions like this:
//   [play](#clickable=play-sound-block)
//
// This code will replace any link that had #clickable=[id]
// with bold clickable text that, when clicked, will call the
// provided handleInstructionsTextClick function with the ID.
//
// The clickable text support in our remark-plugins repo has
// done some intermediate work by converting those links into
// the following HTML format:
//   <b data-id="id" class="clickable-text">text</b>
export class ClickableTextWrapper extends React.Component {
  static propTypes = {
    handleInstructionsTextClick: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  };

  componentDidMount() {
    this.postRenderHook();
  }

  componentDidUpdate(prevProps) {
    // TODO: do we need to do any kind of cleanup here? Or otherwise do
    // something more precise than calling the method again when we're
    // responding to an update rather than an initial render?
    this.postRenderHook();
  }

  postRenderHook() {
    const thisNode = ReactDOM.findDOMNode(this);
    this.renderClickableText(thisNode);
  }

  renderClickableText(node) {
    const clickableTextAll = node.querySelectorAll('b.clickable-text');
    clickableTextAll.forEach((clickableText, index) => {
      const id = clickableText.dataset.id;
      const extraClass = ` clickable-text-with-glow clickable-text-${index}`;
      if (!clickableText.className.includes(extraClass)) {
        clickableText.className += extraClass;
      }
      clickableText.onclick = () => this.props.handleInstructionsTextClick(id);
    });
  }

  render() {
    return this.props.children;
  }
}

/**
 * A wrapper for our SafeMarkdown component which adds some extra
 * functionality.
 *
 * Right now, that extra functionality is limited to:
 *   - Support for the "expandable images" functionality.
 *   - Support for clickable text that shows a callout.
 *
 * But the intent is for this to serve as a common place to implement all of
 * the other things we do on _top_ of markdown; embedded Blockly, links
 * automatically opening in a new tab, etc.
 */
export default class EnhancedSafeMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    openExternalLinksInNewTab: PropTypes.bool,
    expandableImages: PropTypes.bool,
    className: PropTypes.string,
    handleInstructionsTextClick: PropTypes.func,
  };

  render() {
    // The basic idea here is that we start with just a basic Safe Markdown
    // component. We then choose which subset of enhancements we want to add by
    // wrapping the component in other components which each add their own
    // self-contained functionality.
    //
    // Right now, that's just expandable images and clickable text. But we
    // could (should?) take the "open external links" functionality out of
    // SafeMarkdown and add it here; I expect we almost certainly will put the
    // "render blockly blocks" functionality in here, too.
    let result = (
      <SafeMarkdown
        markdown={this.props.markdown}
        openExternalLinksInNewTab={this.props.openExternalLinksInNewTab}
        className={this.props.className}
      />
    );

    if (this.props.expandableImages) {
      result = <ExpandableImagesWrapper>{result}</ExpandableImagesWrapper>;
    }

    if (this.props.handleInstructionsTextClick) {
      result = (
        <ClickableTextWrapper
          handleInstructionsTextClick={this.props.handleInstructionsTextClick}
        >
          {result}
        </ClickableTextWrapper>
      );
    }

    return result;
  }
}
