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
      1 => {id: 1, short_name: 'CS in Science', long_name: 'Computer Science in Science'},
      2 => {id: 2, short_name: 'CS in Algebra', long_name: 'Computer Science in Algebra'},
      3 => {id: 3, short_name: 'ECS', long_name: 'Exploring Computer Science'},
      4 => {id: 4, short_name: 'CSP', long_name: 'Computer Science Principles'},
      5 => {id: 5, short_name: 'K5', long_name: 'Computer Science in K5'}
  }
  PHASES = {
      1 => {id: 1, short_name: 'Phase 1', long_name: 'Phase 1: Online Introduction'},
      2 => {id: 2, short_name: 'Phase 2', long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},
      3 => {id: 3, short_name: 'Phase 2 Online', long_name: 'Phase 2 Online: Blended Summer Study'},
      4 => {id: 4, short_name: 'Phase 3A', long_name: 'Phase 3: Part A'},
      5 => {id: 5, short_name: 'Phase 3B', long_name: 'Phase 3: Part B'},
      6 => {id: 6, short_name: 'Phase 3C', long_name: 'Phase 3: Part C'},
      7 => {id: 7, short_name: 'Phase 3D', long_name: 'Phase 3: Part D'},
      8 => {id: 8, short_name: 'Phase 4', long_name: 'Phase 4: Summer Wrap Up'}
  }
end
