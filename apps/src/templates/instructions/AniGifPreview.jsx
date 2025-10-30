import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import {openDialog} from '../../redux/instructionsDialog';

class ImagePreviewUnwrapped extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    alt: PropTypes.string,
    showInstructionsDialog: PropTypes.func.isRequired,
    noVisualization: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    alt: '',
  };

  handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      this.props.showInstructionsDialog();
    }
  };

  render() {
    const {url, alt, showInstructionsDialog, noVisualization} = this.props;
    let ariaLabel = 'Click or press Enter to view larger image';
    if (alt) {
      ariaLabel = `${ariaLabel}. ${alt}`;
    }

    return (
      <div id="ani-gif-preview-wrapper" style={styles.wrapper}>
        <div
          id="ani-gif-preview"
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          style={[
            styles.aniGifPreview(url),
            noVisualization && styles.bigPreview,
          ]}
          onClick={showInstructionsDialog}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}

const styles = {
  wrapper: {
    display: 'inline-block',
    position: 'relative',
  },
  aniGifPreview: url => ({
    cursor: 'pointer',
    backgroundImage: `url('${url}')`,
  }),
  // In Jigsaw levels, we want anigif preview to be larger (normally it's 80x60)
  bigPreview: {
    width: 240,
    height: 180,
    backgroundSize: '240px 180px',
  },
};

export const ImagePreview = Radium(ImagePreviewUnwrapped);
export default connect(
  state => ({
    url: state.pageConstants.aniGifURL,
    noVisualization: state.pageConstants.noVisualization,
  }),
  dispatch => ({
    showInstructionsDialog() {
      dispatch(openDialog({imgOnly: true}));
    },
  })
)(ImagePreview);
