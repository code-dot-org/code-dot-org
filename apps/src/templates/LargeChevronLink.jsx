import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import FontAwesome from './FontAwesome';
import color from '../util/color';

class LargeChevronLink extends Component {
  static propTypes = {
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {
    const {link, linkText, isRtl} = this.props;
    const localeStyle = isRtl ? styles.right : styles.left;
    const icon = isRtl ? 'chevron-right' : 'chevron-left';

    return (
      <div style={{...styles.linkBox, ...localeStyle}}>
        <a href={link} style={styles.link}>
          {!isRtl && <FontAwesome icon={icon} style={styles.chevron} />}
          <div style={styles.linkText}>{linkText}</div>
        </a>
        <a href={link} style={styles.link}>
          {isRtl && <FontAwesome icon={icon} style={styles.chevron} />}
        </a>
      </div>
    );
  }
}

const styles = {
  link: {
    textDecoration: 'none'
  },
  linkBox: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%'
  },
  linkText: {
    fontSize: 20,
    lineHeight: '22px',
    fontFamily: 'Gotham 5r',
    color: color.teal,
    clear: 'both',
    display: 'inline',
    fontWeight: 'bold',
    marginLeft: 15,
    marginRight: 15
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 20,
    fontWeight: 'bold'
  },
  left: {
    float: 'left'
  },
  right: {
    float: 'right'
  }
};

export default connect(state => ({
  isRtl: state.isRtl
}))(LargeChevronLink);
