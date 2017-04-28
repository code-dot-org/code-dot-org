import color from "../../../util/color";

export const createOutline = color => {
  return `
    ${color} 0 1px,
    ${color} 1px 1px,
    ${color} 1px 0px,
    ${color} 1px -1px,
    ${color} 0 -1px,
    ${color} -1px -1px,
    ${color} -1px 0,
    ${color} -1px 1px`;
};

const baseButtonStyle = {
  fontSize: 14,
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: 10,
  paddingRight: 10,
  whiteSpace: 'nowrap'
};

const progressStyles = {
  baseButton: baseButtonStyle,
  blueButton: Object.assign({}, baseButtonStyle, {
    backgroundColor: color.cyan,
    color: color.white
  }),
  orangeButton: Object.assign({}, baseButtonStyle, {
    backgroundColor: color.orange,
    color: color.white,
  }),
  whiteButton: Object.assign({}, baseButtonStyle, {
    backgroundColor: color.white,
    color: color.dark_charcoal,
    borderColor: color.lighter_gray
  }),
};
export default progressStyles;
