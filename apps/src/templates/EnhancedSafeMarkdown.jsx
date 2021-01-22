import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import SafeMarkdown from './SafeMarkdown';
import {openDialog} from '@cdo/apps/redux/instructionsDialog';
import {renderExpandableImages} from './utils/expandableImages';

/**
 * A wrapper for our SafeMarkdown component which adds some extra
 * functionality.
 *
 * Right now, that extra functionality is limited to support for the
 * "expandable images" functionality, but the intent is for this to serve as a
 * common place to implement all of the other things we do on _top_ of
 * markdown; embedded Blockly, links automatically opening in a new tab, etc.
 */
class EnhancedSafeMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    openExternalLinksInNewTab: PropTypes.bool,
    expandableImages: PropTypes.bool,
    showImageDialog: (props, propName, componentName) => {
      if (
        props.expandableImages === true &&
        typeof props[propName] !== 'function'
      ) {
        return new Error(
          'Please provide a showImageDialog function to enable expandableImages!'
        );
      }
    }
  };

  componentDidMount() {
    this.markdownPostRenderHook();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markdown !== this.props.markdown) {
      this.markdownPostRenderHook();
    }
  }

  /**
   * Do anything that needs to be done after rendering markdown.
   */
  markdownPostRenderHook() {
    if (this.props.expandableImages === true) {
      const thisNode = ReactDOM.findDOMNode(this);
      renderExpandableImages(thisNode, this.props.showImageDialog);
    }
  }

  render() {
    return (
      <SafeMarkdown
        markdown={this.props.markdown}
        openExternalLinksInNewTab={this.props.openExternalLinksInNewTab}
      />
    );
  }
}

export const StatelessEnhancedSafeMarkdown = EnhancedSafeMarkdown;
export default connect(
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
)(EnhancedSafeMarkdown);
