import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from './FontAwesome';
import color from '../util/color';
import {makeEnum} from '@cdo/apps/utils';

const ChevronSide = makeEnum('left', 'right');

export default class SmallChevronLink extends Component {
  static propTypes = {
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    chevronSide: PropTypes.oneOf(Object.values(ChevronSide))
  };

  renderChevron = () => {
    const {isRtl} = this.props;
    const icon = isRtl ? 'chevron-left' : 'chevron-right';

    return (
      <FontAwesome
        icon={icon}
        style={isRtl ? styles.chevronRtl : styles.chevron}
      />
    );
  };

  render() {
    const {link, linkText, chevronSide} = this.props;

    return (
      <div style={styles.linkBox}>
        <a href={link} style={styles.link}>
          {chevronSide === ChevronSide.left && this.renderChevron()}
          <h3 style={styles.link}>{linkText}</h3>
          {(!chevronSide || chevronSide === ChevronSide.right) &&
            this.renderChevron()}
        </a>
      </div>
    );
  }
}

const styles = {
  link: {
    color: color.teal,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    display: 'inline',
    textDecoration: 'none'
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8
  },
  chevronRtl: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8
  },
  linkBox: {
    display: 'block',
    textDecoration: 'none'
  }
};
