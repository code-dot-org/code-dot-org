import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import SafeMarkdown from './SafeMarkdown';
import {openDialog} from '@cdo/apps/redux/instructionsDialog';
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

// A callout can be added via markdown instructions like this:
//   [play](#showcallout=play-sound-block)
//
// This code will replace any link that has #showcallout=[id]
// with bold clickable text that, when clicked, will call the
// provided showCallout function with the ID.
export class ShowCalloutsWrapper extends React.Component {
  static propTypes = {
    showCallout: PropTypes.func.isRequired,
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
    this.renderShowCallouts(thisNode);
  }

  renderShowCallouts(node) {
    const showCallouts = node.querySelectorAll('a[href]');
    for (const showCallout of showCallouts) {
      const regexp = /#showcallout=(.*)/;
      const matches = showCallout.href.match(regexp);
      if (matches?.length === 2) {
        const calloutId = matches[1];
        const textContent = showCallout.childNodes[0].textContent;
        const newNode = document.createElement('span');
        newNode.innerHTML = `<b style="cursor: pointer">${textContent}</b>`;
        newNode.onclick = () => this.props.showCallout(calloutId);
        showCallout.replaceWith(newNode);
      }
    }
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
    showCallout: PropTypes.func,
  };

  render() {
    // The basic idea here is that we start with just a basic Safe Markdown
    // component. We then choose which subset of enhancements we want to add by
    // wrapping the component in other components which each add their own
    // self-contained functionality.
    //
    // Right now, that's just expandable images. But we could (should?) take
    // the "open external links" functionality out of SafeMarkdown and add it
    // here; I expect we almost certainly will put the "render blockly blocks"
    // functionality in here, too.
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

    if (this.props.showCallout) {
      result = (
        <ShowCalloutsWrapper showCallout={this.props.showCallout}>
          {result}
        </ShowCalloutsWrapper>
      );
    }

    return result;
  }
}
