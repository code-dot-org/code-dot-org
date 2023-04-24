import msg from '@cdo/locale';
import authoredHintUtils from './authoredHintUtils';

export default function getAchievements(state) {
  return POSSIBLE_ACHIEVEMENTS.map(possibleAchievement =>
    possibleAchievement(state)
  )
    .filter(achievement => achievement.isAchieved)
    .sort((achievementA, achievementB) => {
      if (achievementA.isAchieved && !achievementB.isAchieved) {
        return -1;
      } else if (!achievementA.isAchieved && achievementB.isAchieved) {
        return 1;
      } else {
        return 0;
      }
    });
}

const POSSIBLE_ACHIEVEMENTS = [puzzleComplete, usingHints];

export function puzzleComplete(state) {
  return {
    isAchieved: true,
    message: msg.puzzleCompleted(),
    successIconUrl: '',
  };
}

export function usingHints(state) {
  const hintsUsed = authoredHintUtils.currentOpenedHintCount(
    state.pageConstants.serverLevelId
  );
  let message, isAchieved;
  if (hintsUsed === 0) {
    message = msg.withoutHints();
    isAchieved = true;
  } else if (hintsUsed === 1) {
    message = msg.usingOneHint();
    isAchieved = true;
  } else {
    message = msg.usingHints();
    isAchieved = false;
  }
  return {
    isAchieved,
    message,
    successIconUrl: '',
    failureIconUrl: '',
  };
}
