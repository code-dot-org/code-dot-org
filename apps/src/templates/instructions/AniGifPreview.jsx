import React from 'react';
import Radium from 'radium';

const styles = {
  wrapper: {
    display: 'inline-block'
  },
  wrapperTopPane: {
    position: 'relative' // override className styling
  },
  aniGifPreview: url => ({
    backgroundImage: `url('${url}')`
  })
};

const AniGifPreview = props => (
  <div
      id="ani-gif-preview-wrapper"
      style={[styles.wrapper, props.inTopPane && styles.wrapperTopPane]}
  >
    <div
        id="ani-gif-preview"
        style={styles.aniGifPreview(props.url)}
    />
  </div>
);

AniGifPreview.propTypes = {
  url: React.PropTypes.string.isRequired
};

export default Radium(AniGifPreview);
