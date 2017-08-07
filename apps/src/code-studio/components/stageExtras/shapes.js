import PropTypes from 'prop-types';


export const bonusLevel = {
  id: PropTypes.number.isRequired,
  map: PropTypes.array,
  name: PropTypes.string.isRequired,
  skin: PropTypes.string,
  startDirection: PropTypes.number,
  type: PropTypes.string.isRequired,
  perfected: PropTypes.bool.isRequired,
};
