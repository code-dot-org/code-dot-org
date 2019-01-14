import $ from 'jquery';

/**
 * Reducer for stats tab in teacher dashboard.
*/

/**
 * Action type constants
 */
 const SET_COMPLETED_LEVEL_COUNT = 'stats/SET_COMPLETED_LEVEL_COUNT';

/**
 * Action creators
 */
const setCompletedLevelCount = completedLevelCountByStudentId => ({ type: SET_COMPLETED_LEVEL_COUNT, completedLevelCountByStudentId });

/**
 * Initial state of statsRedux
 */
const initialState = {
  completedLevelCountByStudentId: {},
};

/**
 * Reducer
 */
 export default function stats(state = initialState, action) {
   if (action.type === SET_COMPLETED_LEVEL_COUNT) {
     return {
       ...state,
       completedLevelCountByStudentId: action.completedLevelCountByStudentId,
     };
   }

   return state;
 }

/**
 * Helper functions
 */
 export const asyncSetCompletedLevelCount = (sectionId) => (dispatch) => {
   $.ajax({
     url: `/dashboardapi/sections/${sectionId}/students/completed_levels_count`,
     method: 'GET',
     dataType: 'json'
   }).done(completedLevelCountByStudentId => {
     dispatch(setCompletedLevelCount(completedLevelCountByStudentId));
   });
 };
