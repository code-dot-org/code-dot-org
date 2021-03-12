import PropTypes from 'prop-types';

export const bonusLevel = {
  id: PropTypes.string.isRequired,
  display_name: PropTypes.string.isRequired,
  description: PropTypes.string,
  thumbnail_url: PropTypes.string,
  url: PropTypes.string.isRequired,
  perfect: PropTypes.bool,
  type: PropTypes.string,
  maze_summary: PropTypes.object
};

export const lessonOfBonusLevels = {
  stageNumber: PropTypes.number.isRequired,
  levels: PropTypes.arrayOf(PropTypes.shape(bonusLevel))
};
