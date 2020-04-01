export const LessonIcons = {
  PLUGGED: 'desktop',
  UNPLUGGED: 'scissors'
};

export const cstaStandardsURL = 'https://www.csteachers.org/page/standards';

// These constants help clarify the meaning of a TeacherScore.score.

// The value of TeacherScores.COMPLETE is consistent with TestResults.ALL_PASS  // in constants.js and ActivityConstants.BEST_PASS_RESULT in
// activity_constants.rb, which clarify the meaning of a UserLevel.best_result.

// The value of TeacherScores.INCOMPLETE is consistent with ResultType.UNSET
// in constants.js, and would evaluate to LevelStatus.not_tried when we get the // activityCssClass used for progress bubble color from activityUtils.js.

export const TeacherScores = {
  COMPLETE: 100,
  INCOMPLETE: 0
};
