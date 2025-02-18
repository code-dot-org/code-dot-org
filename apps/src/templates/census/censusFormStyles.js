import fontConstants from '@cdo/apps/fontConstants';

import color from '../../util/color';

export const styles = {
  formHeading: {
    marginTop: 20,
  },
  checkboxLine: {
    marginTop: 20,
    marginLeft: 38,
  },
  clickable: {
    cursor: 'pointer',
  },
  question: {
    fontSize: 16,
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5,
  },
  pledgeBox: {
    marginBottom: 20,
    marginTop: 20,
  },
  pledge: {
    fontSize: 18,
    ...fontConstants['main-font-bold'],
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10,
    marginLeft: 18,
  },
  share: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
  },
  otherCS: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    marginRight: 20,
    marginLeft: 20,
  },
  option: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    float: 'left',
    width: '80%',
    marginRight: 20,
    marginLeft: 20,
  },
  dropdown: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    height: 30,
    width: 120,
    marginLeft: 18,
    marginTop: 5,
  },
  shareDropdown: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    height: 30,
    width: 50,
    marginLeft: 5,
    marginTop: 5,
  },
  schoolNotFoundDropdown: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    height: 30,
    marginTop: 5,
    width: 250,
  },
  wideDropdown: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    height: 30,
  },
  dropdownBox: {
    width: '100%',
  },
  options: {
    marginLeft: 18,
  },
  checkboxOption: {
    ...fontConstants['main-font-regular'],
    color: color.charcoal,
    marginLeft: 20,
  },
  input: {
    height: 40,
    width: 250,
    ...fontConstants['main-font-regular'],
    padding: 5,
  },
  inputInline: {
    height: 25,
    width: 390,
    ...fontConstants['main-font-regular'],
    padding: 5,
    maxWidth: '80%',
  },
  textArea: {
    height: 100,
    width: '100%',
    ...fontConstants['main-font-regular'],
    padding: 5,
  },
  firstQuestion: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
  },
  grayQuestion: {
    background: color.background_gray,
    padding: 15,
    borderTop: '1px solid gray',
    borderBottom: '1px solid gray',
  },
  errors: {
    fontSize: 14,
    ...fontConstants['main-font-regular'],
    color: color.red,
    paddingTop: 5,
    paddingBottom: 5,
  },
  asterisk: {
    fontSize: 20,
    ...fontConstants['main-font-semi-bold'],
    color: color.red,
  },
  leftMargin: {
    leftMargin: 20,
  },
  field: {
    float: 'left',
    height: '80px',
    width: '450px',
  },
  clear: {
    width: '100%',
    clear: 'both',
  },
};
