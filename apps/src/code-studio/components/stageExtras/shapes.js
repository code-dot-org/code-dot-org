import { PropTypes } from 'react';

export const bonusLevel = {
  id: PropTypes.number.isRequired,
  levelId: PropTypes.number.isRequired,
  map: PropTypes.array,
  name: PropTypes.string.isRequired,
  skin: PropTypes.string,
  solutionImageUrl: PropTypes.string,
  startDirection: PropTypes.number,
  type: PropTypes.string.isRequired,
};

export const stageOfBonusLevels = {
  stageNumber: PropTypes.number.isRequired,
  levels: PropTypes.arrayOf(PropTypes.shape(bonusLevel)),
};
