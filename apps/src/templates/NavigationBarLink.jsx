import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import { NavLink } from 'react-router-dom';

const styles = {
  link: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    lineHeight: '50px',
    color: color.white,
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: 0.75,
  },
  activeLink: {
    opacity: 1,
    paddingBottom: 5,
    borderBottom: '3px solid orange',
  },
};

export default class NavigationBarLink extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    url: PropTypes.string,
  };

  render() {
    const {label, url} = this.props;

    return (
      <NavLink
        to={`/${url}`}
        style={styles.link}
        activeStyle={styles.activeLink}
      >
        <span>{label}</span>
      </NavLink>
    );
  }
}
