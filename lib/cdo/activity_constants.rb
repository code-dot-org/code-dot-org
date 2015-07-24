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
  SUBMITTED_RESULT = 1000
  PROGRAM_TYPES = {
      1 => {short_name: 'CS in Science', long_name: 'Computer Science in Science'},
      2 => {short_name: 'CS in Algebra', long_name: 'Computer Science in Algebra'},
      3 => {short_name: 'ECS', long_name: 'Exploring Computer Science'},
      4 => {short_name: 'CSP', long_name: 'Computer Science Principles'},
      5 => {short_name: 'K5', long_name: 'Computer Science in K5'}
  }
end
