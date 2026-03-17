import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

class LessonExtrasFlagIcon extends React.PureComponent {
  static propTypes = {
    isPerfect: PropTypes.bool,
    isSelected: PropTypes.bool,
    size: PropTypes.number,
  };

  state = {
    isHovering: false,
  };

  render() {
    const {isPerfect, isSelected, size} = this.props;
    const sizeStyle = {...styles.smallStack, fontSize: size};

    let colorStyle = {...styles.default};
    if (isSelected) {
      colorStyle = {...colorStyle, ...styles.selected};
    }
    if (isPerfect) {
      colorStyle = {...colorStyle, ...styles.perfect};
    }
    if (this.state.isHovering) {
      colorStyle = {...colorStyle, ...styles.hover};
    }

    return (
      <span
        className="fa-stack fa-1x"
        style={sizeStyle}
        onMouseEnter={() => this.setState({isHovering: true})}
        onMouseLeave={() => this.setState({isHovering: false})}
      >
        <i className="fa fa-flag fa-stack-1x fa-inverse" />
        <i className="fa fa-flag-checkered fa-stack-1x" style={colorStyle} />
      </span>
    );
  }
}

export default LessonExtrasFlagIcon;

const styles = {
  default: {
    color: color.lighter_gray,
  },
  selected: {
    color: color.charcoal,
  },
  perfect: {
    color: color.level_perfect,
  },
  hover: {
    color: color.orange,
  },
  smallStack: {
    width: '1em',
    height: '1.1em',
    lineHeight: '1em',
  },
};
