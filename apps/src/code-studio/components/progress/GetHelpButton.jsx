import React from 'react';
import HrefButton from '@cdo/apps/templates/HrefButton';
import color from '@cdo/apps/util/color';

const styles = {
  form: {
    marginBottom: 5,
    display: 'inline-block'
  },
  input: {
    fontSize: 20,
    height: 40,
    fontSize: 20,
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 12,
    paddingRight: 12,
    whitespace: 'pre',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    textShadow: '0 -1px 0 rgba(0,0,0,0.25)',

    backgroundColor: color.white,
    color: color.dark_charcoal,
    borderColor: color.lighter_gray,
  }
};

// TODO - i18n
// TODO - common button components
// const GetHelpButton = ({style}) => (
//   <form
//     style={{...styles.form, ...style}}
//     method="get"
//     action="//support.code.org"
//   >
//     <input
//       style={styles.input}
//       type="submit"
//       value="Get Help"
//     />
//   </form>
// );

const GetHelpButton = ({style}) => (
  <HrefButton
    href="//support.code.org"
    text="Get Help"
    type="default"
    style={style}
  />
);

GetHelpButton.propTypes = {
  style: React.PropTypes.object
};

export default GetHelpButton;
