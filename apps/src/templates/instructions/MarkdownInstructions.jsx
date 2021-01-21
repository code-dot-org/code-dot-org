import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import {convertXmlToBlockly} from './utils';
import {openDialog} from '@cdo/apps/redux/instructionsDialog';
import {renderExpandableImages} from '../utils/expandableImages';

import SafeMarkdown from '../SafeMarkdown';

const styles = {
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
    marginBottom: 0
  }
};

class MarkdownInstructions extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    noInstructionsWhenCollapsed: PropTypes.bool,
    onResize: PropTypes.func,
    inTopPane: PropTypes.bool,
    isBlockly: PropTypes.bool,
    showImageDialog: PropTypes.func
  };

  static defaultProps = {
    noInstructionsWhenCollapsed: false
  };

  componentDidMount() {
    this.configureMarkdown_();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markdown !== this.props.markdown) {
      this.configureMarkdown_();
    }
  }

  componentWillUnmount() {
    const detailsDOM = $(ReactDOM.findDOMNode(this)).find('details');
    if (detailsDOM.details) {
      detailsDOM.off('toggle.details.TopInstructions');
    }
  }

  /**
   * Attach any necessary jQuery to our markdown
   */
  configureMarkdown_() {
    if (!this.props.onResize) {
      return;
    }

    const thisNode = ReactDOM.findDOMNode(this);
    // If we have the jQuery details plugin, enable its usage on any details
    // elements
    const detailsDOM = $(thisNode).find('details');
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
    $(thisNode)
      .find('img')
      .load(this.props.onResize);

    renderExpandableImages(thisNode, this.props.showImageDialog);
  }

  render() {
    const {inTopPane, markdown} = this.props;

    const canCollapse = !this.props.noInstructionsWhenCollapsed;
    return (
      <div
        className="instructions-markdown"
        style={[
          styles.standard,
          inTopPane && styles.inTopPane,
          inTopPane && canCollapse && styles.inTopPaneCanCollapse
        ]}
      >
        <SafeMarkdown markdown={markdown} />
      </div>
    );
  }
}

export const StatelessMarkdownInstructions = Radium(MarkdownInstructions);
export default connect(
  state => ({
    isBlockly: state.pageConstants.isBlockly,
    noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed
  }),
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
)(Radium(MarkdownInstructions));
