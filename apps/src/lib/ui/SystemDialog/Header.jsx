import React, {PropTypes} from 'react';
import color from '@cdo/apps/util/color';

/**
 * Header for a "System" dialog style used on account pages.
 */
export default class Header extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    hideBorder: PropTypes.bool,
  };

  render() {
    const computedStyle = {
      ...style,
      ...(this.props.hideBorder && {
        borderBottomWidth: 0,
        paddingBottom: 5,
      }),
    };
    return (
      <h1 style={computedStyle}>
        {this.props.text}
      </h1>
    );
  }
}

const style = {
  fontSize: 16,
  lineHeight: '20px',
  color: color.charcoal,
  fontFamily: "'Gotham 5r', sans-serif",
  borderStyle: 'solid',
  borderColor: color.lighter_gray,
  borderTopWidth: 0,
  borderBottomWidth: 1,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  paddingBottom: 10,
  paddingTop: 0,
  paddingLeft: 0,
  paddingRight: 0,
  marginBottom: 10,
  marginTop: 10,
};
