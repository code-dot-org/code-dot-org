/**
 * Expected AI tutor output for each (level × state × videoRequested) combination.
 *
 * Keys follow the pattern:
 *   `${levelId}_${StudioStateEnum}_VIDEO`   — student explicitly asked for a video
 *   `${levelId}_${StudioStateEnum}_NOVIDEO` — student did not ask for a video
 *
 * `expectedVideos` is the set of videos the AI tutor should return (empty = none expected).
 */
import {PythonLabEvalEntry} from './aiTutorTestTypes';

export const pythonLabEvalData: Record<string, PythonLabEvalEntry> = {
  // -------------------------------------------------------------------------
  // Level 1: programming-fundamentals-lesson5-level1_2025-launch_2025
  // Topic: Painter Object basics (predict/read-only)
  // Primary concept: Painter Object
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level1_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 2: programming-fundamentals-lesson5-level2_2025-launch_2025
  // Topic: Create a Painter and move it one space
  // Primary concept: Painter Object
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level2_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 3: programming-fundamentals-lesson5-level5_2025-launch_2025
  // Topic: Fix missing Painter object
  // Primary concept: Painter Object
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level5_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 4: programming-fundamentals-lesson5-level6_2025-launch_2025
  // Topic: Variables — 4 typed variables
  // Primary concept: Variables
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level6_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Variables_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 5: programming-fundamentals-lesson5-level7a_2025-launch_2025
  // Topic: Debug — double turn_left bug
  // Primary concept: Painter Object
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 6: programming-fundamentals-lesson5-level8_2025-launch_2025
  // Topic: Debug — wrong command order, Painter next to cone instead of in front
  // Primary concept: Painter Object
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level8_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 7: programming-fundamentals-lesson5-level9_2025-launch_2025
  // Topic: Painter navigation practice
  // Primary concept: Painter Object
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level9_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Painter_Object_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 8: programming-fundamentals-lesson6-level7_2025-launch_2025
  // Topic: Functions with parameters
  // Primary concept: Functions with parameters
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson6-level7_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Functions_With_Parameters_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 9: programming-fundamentals-lesson7-level6_2025-launch_2025
  // Topic: Debugging with strategies
  // Primary concept: Functions
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson7-level6_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },

  // -------------------------------------------------------------------------
  // Level 10: programming-fundamentals-lesson7-level9_2025-launch_2025
  // Topic: Define missing paint_spaces() function, reorder actions
  // Primary concept: Functions
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson7-level9_2025-launch_2025_START_NOVIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_START_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_STRUGGLING_NOVIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_STRUGGLING_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_SYNTAX_ERRORS_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_RUNTIME_ERRORS_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_GOOD_PROGRESS_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_ALMOST_THERE_NOVIDEO': {
    expectedVideos: [],
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_ALMOST_THERE_VIDEO': {
    expectedVideos: ['Functions_V1.json'],
  },


  // Level 11: programming-fundamentals-lesson8-level1_2025-launch_2025
  // Topic: While loops — replace repeated move() calls
  // Primary concept: While Loops
  'programming-fundamentals-lesson8-level1_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 12: programming-fundamentals-lesson8-level2_2025-launch_2025
  // Topic: While loops — replace repeated paint()+move() with while has_paint()
  // Primary concept: While Loops
  'programming-fundamentals-lesson8-level2_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 13: programming-fundamentals-lesson8-level3_2025-launch_2025
  // Topic: While loops — replace repeated take_paint() with while is_on_bucket()
  // Primary concept: While Loops
  'programming-fundamentals-lesson8-level3_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 14: programming-fundamentals-lesson8-level4_2025-launch_2025
  // Topic: While loop indentation bug — move() is outside the loop
  // Primary concept: While Loops
  'programming-fundamentals-lesson8-level4_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 15: programming-fundamentals-lesson8-level5_2025-launch_2025
  // Topic: While loop never runs — Painter starts with 0 paint
  // Primary concept: While Loops
  'programming-fundamentals-lesson8-level5_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 16: programming-fundamentals-lesson8-level6_2025-launch_2025
  // Topic: Write custom functions with while loops
  // Primary concept: While Loops (also Functions)
  'programming-fundamentals-lesson8-level6_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 17: programming-fundamentals-lesson8-level8a_2025-launch_2025
  // Topic: Import custom.py from Backpack, define take_all_paint()
  // Primary concept: While Loops + Functions
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 18: programming-fundamentals-lesson9-level1_2025-launch_2025
  // Topic: Conditionals — add if is_facing_west() inside a while loop
  // Primary concept: Conditionals
  'programming-fundamentals-lesson9-level1_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_START_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },

  // Level 19: programming-fundamentals-lesson9-level2a_2025-launch_2025
  // Topic: Conditionals — modify if to check can_move("south")
  // Primary concept: Conditionals
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_START_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },

  // Level 20: programming-fundamentals-lesson9-level3_2025-launch_2025
  // Topic: Conditionals — write if is_on_paint(): turn_right(); move()
  // Primary concept: Conditionals
  'programming-fundamentals-lesson9-level3_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_START_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  // Level 21: programming-fundamentals-lesson9-level6_2025-launch_2025
  // Primary concept: Conditionals + If/Else
  'programming-fundamentals-lesson9-level6_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_START_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson9-level6_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },

  // Level 22: programming-fundamentals-lesson10-level1_2025
  // Primary concept: Conditionals
  'programming-fundamentals-lesson10-level1_2025_START_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_START_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_STRUGGLING_VIDEO': { expectedVideos: ['Functions_With_Parameters_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson10-level1_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson10-level1_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson10-level1_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Conditionals_V1.json'] },
  'programming-fundamentals-lesson10-level1_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson10-level1_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Functions_With_Parameters_V1.json'] },

  // Level 23: programming-fundamentals-lesson11-level1_2025
  // Primary concept: While Loops + Functions
  'programming-fundamentals-lesson11-level1_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson11-level1_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Functions_With_Parameters_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson11-level1_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson11-level1_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson11-level1_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson11-level1_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },

  // Level 24: programming-fundamentals-lesson12-level1_2025-launch_2025
  // Primary concept: Conditionals/If-Else + Painter
  'programming-fundamentals-lesson12-level1_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_START_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level1_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Painter_Object_V1.json'] },

  // Level 25: programming-fundamentals-lesson12-level4_2025-launch_2025
  // Primary concept: If/Else
  'programming-fundamentals-lesson12-level4_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_START_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level4_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['If_Else_V1.json'] },

  // Level 26: programming-fundamentals-lesson12-level5_2025-launch_2025
  // Primary concept: Functions
  'programming-fundamentals-lesson12-level5_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_START_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Functions_With_Parameters_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Functions_With_Parameters_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level5_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Functions_V1.json'] },

  // Level 27: programming-fundamentals-lesson12-level6_2025-launch_2025
  // Primary concept: If/Else
  'programming-fundamentals-lesson12-level6_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_START_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['If_Else_V1.json'] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level6_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['If_Else_V1.json'] },

  // Level 28: programming-fundamentals-lesson12-level8_2025-launch_2025
  // Primary concept: Functions
  'programming-fundamentals-lesson12-level8_2025-launch_2025_START_NOVIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_START_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_STRUGGLING_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['Functions_With_Parameters_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['Functions_V1.json'] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson12-level8_2025-launch_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['Functions_V1.json'] },

  // Level 29: programming-fundamentals-lesson13-level1_2025
  // Primary concept: While Loops + Functions
  'programming-fundamentals-lesson13-level1_2025_START_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_START_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_STRUGGLING_NOVIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_STRUGGLING_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_SYNTAX_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson13-level1_2025_SYNTAX_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_RUNTIME_ERRORS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson13-level1_2025_RUNTIME_ERRORS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_GOOD_PROGRESS_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson13-level1_2025_GOOD_PROGRESS_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
  'programming-fundamentals-lesson13-level1_2025_ALMOST_THERE_NOVIDEO': { expectedVideos: [] },
  'programming-fundamentals-lesson13-level1_2025_ALMOST_THERE_VIDEO': { expectedVideos: ['While_Loops_V1.json'] },
};
