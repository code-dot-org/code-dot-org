// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

export const SET_SECTION_ID = 'scriptSelection/SET_SECTION_ID';
export const SET_VALID_SCRIPTS = 'scriptSelection/SET_VALID_SCRIPTS';

const DEFAULT_SCRIPT_NAME = "Express Course";

export const setValidScripts = (validScripts, studentScriptIds, validCourses, assignedCourseId) => (
  {type: SET_VALID_SCRIPTS, validScripts, studentScriptIds, validCourses, assignedCourseId}
);

// Initial state of scriptSelectionRedux
const initialState = {
  scriptId: null,
  validScripts: [],
};

export default function scriptSelection(state=initialState, action) {
  if (action.type === SET_SECTION_ID) {
    // Setting the sectionId is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState,
      sectionId: action.sectionId
    };
  }

  if (action.type === SET_VALID_SCRIPTS) {

    // Computes the set of valid scripts.
    let validScripts = action.validScripts;
    // Set defaultScript to Express Course to use if there are no validScripts
    const defaultScript = validScripts.find(script => script.name === DEFAULT_SCRIPT_NAME);

    if (action.studentScriptIds && action.validCourses) {
      const idMap = {};
      // First, construct an id map consisting only of script ids which a
      // student has participated in.
      action.studentScriptIds.forEach(id => idMap[id] = true);

      // If the student has participated in a script which is a unit in a
      // course, or if this section is assigned to a course, make sure that
      // all units in that course are included.
      action.validCourses.forEach(course => {
        if (
          course.script_ids.some(id => idMap[id]) ||
          (action.assignedCourseId && action.assignedCourseId === course.id)
        ) {
          course.script_ids.forEach(id => idMap[id] = true);
        }
      });
      validScripts = validScripts.filter(script => idMap[script.id]);
      // If we filter out everything, add the defaultScript to validScripts
      // to avoid having an empty dropdown menu.
      if (validScripts.length === 0) {
        validScripts.push(defaultScript);
      }

      // Uses the set of valid scripts to determine the current scriptId.
      var scriptId;
      switch (true) {
        // When there is a scriptId already in state.
        case !!state.scriptId:
          scriptId = state.scriptId;
          break;
        // When there is an assigned course, set scriptId to the first script in the assigned course.
        case !!action.assignedCourseId:
          action.validCourses.forEach(course => {
            if (course.id === action.assignedCourseId) {
              scriptId = course.script_ids[0];
            }
          });
          break;
        // Set scriptId to the first valid script.  If there weren't any
        // valid scripts, this will be the default script.
        default:
          scriptId = validScripts[0].id;
      }
    }

    return {
      ...state,
      validScripts,
      scriptId: scriptId,
    };
  }

  return state;
}

export const loadValidScripts = (section, validScripts) => {
  return (dispatch, getState) => {
    const promises = [
      $.ajax({
        method: 'GET',
        url: `/dashboardapi/sections/${section.id}/student_script_ids`,
        dataType: 'json'
      }),
      $.ajax({
        method: 'GET',
        url: `/dashboardapi/courses?allVersions=1`,
        dataType: 'json'
      })
    ];
    Promise.all(promises).then(data => {
      let [studentScriptsData, validCourses] = data;
      const { studentScriptIds } = studentScriptsData;
      dispatch(setValidScripts(validScripts, studentScriptIds, validCourses, section.course_id));
    });
  };
};

