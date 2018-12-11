import $ from 'jquery';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import { ImagePreview } from './AniGifPreview';
import { connect } from 'react-redux';
import { convertXmlToBlockly } from './utils';
import { openDialog } from '@cdo/apps/redux/instructionsDialog';

import UnsafeRenderedMarkdown from '../UnsafeRenderedMarkdown';

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
    marginBottom: 0,
  },
};

class MarkdownInstructions extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    noInstructionsWhenCollapsed: PropTypes.bool,
    onResize: PropTypes.func,
    inTopPane: PropTypes.bool,
    isBlockly: PropTypes.bool,
    showImageDialog: PropTypes.func,
  };

  static defaultProps = {
    noInstructionsWhenCollapsed: false,
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
    $(thisNode).find('img').load(this.props.onResize);

    const expandableImages = thisNode.querySelectorAll('.expandable-image');
    for (let i = 0; i < expandableImages.length; i++) {
      const expandableImg = expandableImages[i];
      ReactDOM.render(
        <ImagePreview
          url={expandableImg.dataset.url}
          noVisualization={false}
          showInstructionsDialog={() => this.props.showImageDialog(expandableImg.dataset.url)}
        />, expandableImg);
    }
  }

  render() {
    const {
      inTopPane,
      markdown,
    } = this.props;

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
        <UnsafeRenderedMarkdown markdown={markdown} />
      </div>
    );
  }
}

export const StatelessMarkdownInstructions = Radium(MarkdownInstructions);
export default connect(state => ({
  isBlockly: state.pageConstants.isBlockly,
  noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
}), dispatch => ({
  showImageDialog(imgUrl) {
    dispatch(openDialog({
      autoClose: false,
      imgOnly: true,
      hintsOnly: false,
      imgUrl,
    }));
  },
}))(Radium(MarkdownInstructions));
