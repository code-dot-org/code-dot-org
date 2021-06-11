import PropTypes from 'prop-types';

export const videoDataShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  name: PropTypes.string,
  key: PropTypes.string,
  download: PropTypes.string,
  thumbnail: PropTypes.string,
  enable_fallback: PropTypes.bool,
  autoplay: PropTypes.bool
});
