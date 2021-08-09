import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

class LessonExtrasFlagIcon extends React.PureComponent {
  static propTypes = {
    isPerfect: PropTypes.bool,
    isSelected: PropTypes.bool,
    size: PropTypes.number
  };

  render() {
    const {isPerfect, isSelected, size} = this.props;
    const sizeStyle = {...styles.smallStack, fontSize: size};
    const colorStyle = {
      ...styles.default,
      ...(isSelected && styles.selected),
      ...(isPerfect && styles.perfect)
    };

    return (
      <span className="fa-stack fa-1x" style={sizeStyle}>
        <i className="fa fa-flag fa-stack-1x fa-inverse" />
        <i className="fa fa-flag-checkered fa-stack-1x" style={colorStyle} />
      </span>
    );
  }
}

export default Radium(LessonExtrasFlagIcon);

const styles = {
  default: {
    color: color.lighter_gray,
    ':hover': {
      color: color.orange
    }
  },
  selected: {
    color: color.charcoal
  },
  perfect: {
    color: color.level_perfect
  },
  smallStack: {
    width: '1em',
    height: '1.1em',
    lineHeight: '1em'
  }
};
