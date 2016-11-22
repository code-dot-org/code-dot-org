import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

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

const AniGifPreview = React.createClass({
  propTypes: {
    url: React.PropTypes.string.isRequired,
    noVisualization: React.PropTypes.bool.isRequired,
    showAniGifModal: React.PropTypes.func.isRequired,
  },

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
          onClick={this.props.showAniGifModal}
        />
      </div>
    );
  }
});

export default connect(state => ({
  url: state.pageConstants.aniGifURL,
  noVisualization: state.pageConstants.noVisualization,
  showAniGifModal: state.pageConstants.showAniGifModal
}))(Radium(AniGifPreview));
