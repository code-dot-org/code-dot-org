import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { openDialog } from '../../redux/instructionsDialog';

const styles = {
  wrapper: {
    display: 'inline-block',
    position: 'absolute'
  },
  wrapperTopPane: {
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

const AniGifPreview = React.createClass({
  render() {
    return (
      <div
          id="ani-gif-preview-wrapper"
          style={[styles.wrapper, this.props.instructionsInTopPane && styles.wrapperTopPane]}
      >
        <div
            id="ani-gif-preview"
            style={[
              styles.aniGifPreview(this.props.url),
              this.props.noVisualization && styles.bigPreview
            ]}
            onClick={this.props.instructionsInTopPane ? this.props.showInstructionsDialog : undefined}
        />
      </div>
    );
  }
});

AniGifPreview.propTypes = {
  url: React.PropTypes.string.isRequired,
  instructionsInTopPane: React.PropTypes.bool.isRequired,
  showInstructionsDialog: React.PropTypes.func.isRequired
};

export default connect(state => ({
  url: state.pageConstants.aniGifURL,
  noVisualization: state.pageConstants.noVisualization,
  instructionsInTopPane: state.pageConstants.instructionsInTopPane
}), dispatch => ({
  showInstructionsDialog() {
    dispatch(openDialog({
      autoClose: false,
      showHints: true,
      aniGifOnly: true,
      hintsOnly: false
    }));
  }
}))(Radium(AniGifPreview));
