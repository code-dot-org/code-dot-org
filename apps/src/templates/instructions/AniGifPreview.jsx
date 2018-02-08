import React, {PropTypes} from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { openDialog } from '../../redux/instructionsDialog';

const styles = {
  wrapper: {
    display: 'inline-block',
    position: 'relative'
  },
  aniGifPreview: url => ({
    cursor: 'pointer',
    backgroundImage: `url('${url}')`
  }),
  // In Jigsaw levels, we want anigif preview to be larger (normally it's 80x60)
  bigPreview: {
    width: 240,
    height: 180,
    backgroundSize: '240px 180px'
  }
};

class ImagePreviewUnwrapped extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    showInstructionsDialog: PropTypes.func.isRequired,
    noVisualization: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <div
        id="ani-gif-preview-wrapper"
        style={styles.wrapper}
      >
        <div
          id="ani-gif-preview"
          style={[
              styles.aniGifPreview(this.props.url),
              this.props.noVisualization && styles.bigPreview
            ]}
          onClick={this.props.showInstructionsDialog}
        />
      </div>
    );
  }
}

export const ImagePreview = Radium(ImagePreviewUnwrapped);
export default connect(state => ({
  url: state.pageConstants.aniGifURL,
  noVisualization: state.pageConstants.noVisualization,
}), dispatch => ({
  showInstructionsDialog() {
    dispatch(openDialog({
      autoClose: false,
      imgOnly: true,
      hintsOnly: false,
    }));
  }
}))(ImagePreview);
