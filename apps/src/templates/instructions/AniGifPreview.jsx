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
  })
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
            style={styles.aniGifPreview(this.props.url)}
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
  instructionsInTopPane: state.pageConstants.instructionsInTopPane
}), dispatch => ({
  showInstructionsDialog() {
    dispatch(openDialog(false, true));
  }
}))(Radium(AniGifPreview));
