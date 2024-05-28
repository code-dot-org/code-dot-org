import fontConstants from '@cdo/apps/fontConstants';
import color from '@cdo/apps/util/color';

const PROGRAM_CSD =
  'Computer Science Discoveries (appropriate for 6th - 10th grade)';
const PROGRAM_CSP =
  'Computer Science Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or non-AP introductory course)';
const PROGRAM_CSA =
  'Computer Science A (appropriate for 10th - 12th grade, and can be implemented as an AP or non-AP introductory Java programming course)';

const styles = {
  indented: {
    marginLeft: 20,
  },
  formText: {
    fontSize: 14,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 'bold',
  },
  checkBoxAfterButtonList: {
    marginTop: -30,
  },
  bold: {
    ...fontConstants['main-font-bold'],
  },
  linkLike: {
    ...fontConstants['main-font-bold'],
    cursor: 'pointer',
    color: color.purple,
  },
  red: {
    color: color.red,
  },
  error: {
    color: color.red,
  },
};

function getProgramInfo(program) {
  switch (program) {
    case PROGRAM_CSD:
      return {name: 'CS Discoveries', shortName: 'CSD', minCourseHours: 25};
    case PROGRAM_CSP:
      return {name: 'CS Principles', shortName: 'CSP', minCourseHours: 100};
    case PROGRAM_CSA:
      return {name: 'CSA', shortName: 'CSA', minCourseHours: 140};
    default:
      return {name: 'CS Program', shortName: null, minCourseHours: 0};
  }
}

export {PROGRAM_CSD, PROGRAM_CSP, PROGRAM_CSA, styles, getProgramInfo};
