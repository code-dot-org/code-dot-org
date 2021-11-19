import color from '@cdo/apps/util/color';

const PROGRAM_CSD =
  'Computer Science Discoveries (appropriate for 6th - 10th grade)';
const PROGRAM_CSP =
  'Computer Science Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)';
const PROGRAM_CSA =
  'Computer Science A (appropriate for 10th - 12th grade, and can be implemented as an AP or non-AP introductory Java programming course)';

const styles = {
  indented: {
    marginLeft: 20
  },
  formText: {
    fontSize: 14
  },
  questionText: {
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 'bold'
  },
  checkBoxAfterButtonList: {
    marginTop: -30
  },
  bold: {
    fontFamily: '"Gotham 7r", sans-serif'
  },
  linkLike: {
    fontFamily: '"Gotham 7r", sans-serif',
    cursor: 'pointer',
    color: color.purple
  },
  red: {
    color: color.red
  }
};

export {PROGRAM_CSD, PROGRAM_CSP, PROGRAM_CSA, styles};
