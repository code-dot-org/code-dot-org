/**
 * This component is a button that navigates to a particular URL when clicked.
 * Ideally in the longterm, it would share more with our Button.jsx component
 */

import React from 'react';
import { BUTTON_TYPES } from './Button';

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
  }
};

const HrefButton = ({href, text, type, style}) => {
  return (
    <form
      style={{...styles.form, ...style}}
      method="get"
      action={href}
    >
      <input
        style={{...styles.input, ...BUTTON_TYPES[type].style}}
        type="submit"
        value={text}
      />
    </form>
  );
};

HrefButton.propTypes = {
  href: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired,
  type: React.PropTypes.oneOf(Object.keys(BUTTON_TYPES)),
  style: React.PropTypes.object
};

export default HrefButton;
