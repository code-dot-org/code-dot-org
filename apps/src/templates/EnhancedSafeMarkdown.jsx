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
      PropTypes.node
    ]).isRequired
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

export const ExpandableImagesWrapper = connect(
  null,
  dispatch => ({
    showImageDialog(imgUrl) {
      dispatch(
        /*
         * TODO: Using the 'DialogInstructions' component to display the
         * "expanded image" dialog generates the following warning:
         *
         * > Warning: Failed prop type: The prop `shortInstructions` is marked as
         * > required in `DialogInstructions`, but its value is `undefined`.
         * >     in DialogInstructions (created by Connect(DialogInstructions))
         * >     in Connect(DialogInstructions)
         * >     in Provider
         *
         * We should either update the existing DialogInstructions component to
         * make it more compatible with non-instructions content, or create a
         * separate Dialog component specifically for these images.
         */
        openDialog({
          autoClose: false,
          imgOnly: true,
          hintsOnly: false,
          imgUrl
        })
      );
    }
  })
)(UnconnectedExpandableImagesWrapper);

/**
 * A wrapper for our SafeMarkdown component which adds some extra
 * functionality.
 *
 * Right now, that extra functionality is limited to support for the
 * "expandable images" functionality, but the intent is for this to serve as a
 * common place to implement all of the other things we do on _top_ of
 * markdown; embedded Blockly, links automatically opening in a new tab, etc.
 */
export default class EnhancedSafeMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    openExternalLinksInNewTab: PropTypes.bool,
    expandableImages: PropTypes.bool
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
      />
    );

    if (this.props.expandableImages) {
      result = <ExpandableImagesWrapper>{result}</ExpandableImagesWrapper>;
    }

    return result;
  }
}
