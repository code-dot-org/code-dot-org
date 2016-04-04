module ActivityConstants
  # These values correspond to constants from
  # /blockly/src/constants.js and help describe the meaning of the
  # numeric score/result of a user attempting a blockly level. In
  # dashboard these are stored in Activity.result and
  # UserLevel.best_result (UserLevel is an aggregate of Activity)

  MINIMUM_FINISHED_RESULT = 10
  MINIMUM_PASS_RESULT = 20
  MAXIMUM_NONOPTIMAL_RESULT = 29
  FREE_PLAY_RESULT = 30
  BEST_PASS_RESULT = 100
end
