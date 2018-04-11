import React, {Component, PropTypes} from 'react';
import FontAwesome from './FontAwesome';
import color from "../util/color";

const styles = {
  link: {
    color: color.teal,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    display: 'inline',
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chevronRtl: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  linkBox: {
    display: 'block',
    paddingBottom: 20,
    textDecoration: 'none'
  },
};

export default class SmallChevronLink extends Component {
  static propTypes = {
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  render() {
    const { link, linkText, isRtl }= this.props;

    const icon = isRtl ? "chevron-left" : "chevron-right";

    return (
      <div style={styles.linkBox}>
        <a href={link}>
          <h3 style={styles.link}>
            {linkText}
          </h3>
          <FontAwesome
            icon={icon}
            style={isRtl? styles.chevronRtl : styles.chevron}
          />
        </a>
      </div>
    );
  }
}
