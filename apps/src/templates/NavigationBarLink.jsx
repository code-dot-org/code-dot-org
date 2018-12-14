import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";

const styles = {
  link: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    lineHeight: '50px',
    color: color.white,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  activeLink: {
    opacity: 1,
    paddingBottom: 5,
    borderBottom: '3px solid orange',
  },
  inactiveLink: {
    opacity: 0.75,
  }
};

export default class NavigationBarLink extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    active: PropTypes.bool,
  };

  render() {
    const {label, active} = this.props;
    const linkStyle = active ? styles.activeLink : styles.inactiveLink;

    return (
      <span style={{...styles.link, ...linkStyle}}>
        <span>{label}</span>
      </span>
    );
  }
}
