import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {makeEnum} from '@cdo/apps/utils';

export const BubbleSize = makeEnum('dot', 'letter', 'full');
const BubbleShape = makeEnum('circle', 'diamond', 'pill');

const CIRCLE_SIZE_DOT = 13;
const CIRCLE_SIZE_LETTER = 20;
const CIRCLE_SIZE_FULL = 34;

const LARGE_FONT = 16;
const SMALL_FONT = 12;

const bubbleSizes = {
  [BubbleShape.circle]: {
    [BubbleSize.dot]: CIRCLE_SIZE_DOT,
    [BubbleSize.letter]: CIRCLE_SIZE_LETTER,
    [BubbleSize.full]: CIRCLE_SIZE_FULL
  },
  [BubbleShape.diamond]: {
    [BubbleSize.dot]: 10,
    [BubbleSize.full]: 26
  },
  [BubbleShape.pill]: {}
};

const fontSizes = {
  [BubbleShape.circle]: {
    [BubbleSize.letter]: SMALL_FONT,
    [BubbleSize.full]: LARGE_FONT
  },
  [BubbleShape.diamond]: {
    [BubbleSize.full]: LARGE_FONT
  }
};

const styles = {
  main: {
    ...progressStyles.flex,
    ...progressStyles.font,
    boxSizing: 'border-box',
    letterSpacing: -0.11,
    position: 'relative',
    margin: '3px 0px',
    whiteSpace: 'nowrap'
  },
  pill: {
    borderRadius: 20,
    fontSize: SMALL_FONT,
    padding: '6px 10px'
  },
  diamond: {
    transform: 'rotate(45deg)',
    padding: 2
  },
  diamondContentTransform: {
    transform: 'rotate(-45deg)'
  },
  bonusDisabled: {
    backgroundColor: color.lighter_gray,
    color: color.white
  }
};

function circleStyle(size) {
  const bubbleSize = bubbleSizes[BubbleShape.circle][size];
  const fontSize = fontSizes[BubbleShape.circle][size];
  const horizontalMargin = size === BubbleSize.full ? 0 : 3;
  return {
    ...progressStyles.tightlyConstrainedSizeStyle(bubbleSize),
    borderRadius: bubbleSize,
    fontSize: fontSize,
    lineHeight: fontSize,
    margin: `3px ${horizontalMargin}px`
  };
}

function diamondStyle(size) {
  const bubbleSize = bubbleSizes[BubbleShape.diamond][size];
  const fontSize = fontSizes[BubbleShape.diamond][size];
  const horizontalMargin = size === BubbleSize.full ? 0 : 1;
  return {
    ...styles.diamond,
    ...progressStyles.tightlyConstrainedSizeStyle(bubbleSize),
    borderRadius: size === BubbleSize.full ? 4 : 2,
    fontSize: fontSize,
    lineHeight: fontSize,
    margin: `6px ${horizontalMargin}px`
  };
}

function shapeSizeStyle(shape, size) {
  return shape === BubbleShape.pill
    ? styles.pill
    : shape === BubbleShape.diamond
    ? diamondStyle(size)
    : circleStyle(size);
}

/**
 * Container applying rotation transforms and forcing diamond bubbles to have
 * the same size as circles.
 * @param {BubbleSize} size
 * @param {object} bubbleStyle contains rotation transform and progress style
 * @param {node} children
 */
function DiamondContainer({size, bubbleStyle, children}) {
  const containerWidth = bubbleSizes[BubbleShape.circle][size];
  const containerStyle = {
    ...progressStyles.flex,
    width: containerWidth,
    height: containerWidth
  };
  return (
    // Constrain size
    <div style={containerStyle}>
      {/* Apply rotation transform and progress style */}
      <div style={bubbleStyle}>
        {/* Undo the rotation from the parent */}
        <div style={styles.diamondContentTransform}>{children}</div>
      </div>
    </div>
  );
}
DiamondContainer.propTypes = {
  size: PropTypes.string,
  bubbleStyle: PropTypes.object,
  children: PropTypes.node
};

/**
 * Base bubble component defined in terms of shape, size, and style, as opposed
 * to level-related properties.
 * @param {} props
 */
function BasicBubble({shape, size, progressStyle, children}) {
  let bubbleStyle = {
    ...styles.main,
    ...progressStyle,
    ...shapeSizeStyle(shape, size)
  };
  if (shape === BubbleShape.diamond) {
    return (
      <DiamondContainer bubbleStyle={bubbleStyle}>{children}</DiamondContainer>
    );
  }
  return <div style={bubbleStyle}>{children}</div>;
}
BasicBubble.propTypes = {
  shape: PropTypes.string,
  size: PropTypes.string,
  progressStyle: PropTypes.object,
  children: PropTypes.node
};
function LinkWrapper(props) {
  return (
    <a href={props.url} style={progressStyles.link}>
      {props.children}
    </a>
  );
}
LinkWrapper.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
};

/**
 * Top-level bubble component responsible for configuring BasicBubble based on
 * properties of a level and student progress.
 */
class ProgressTableLevelBubble extends React.PureComponent {
  static propTypes = {
    levelStatus: PropTypes.string,
    levelKind: PropTypes.string,
    isDisabled: PropTypes.bool,
    isUnplugged: PropTypes.bool,
    isConcept: PropTypes.bool,
    isBonus: PropTypes.bool,
    isPaired: PropTypes.bool,
    bubbleSize: PropTypes.string.isRequired,
    title: PropTypes.string,
    url: PropTypes.string
  };

  static defaultProps = {
    bubbleSize: BubbleSize.full
  };

  progressStyle() {
    const {levelStatus, levelKind, isDisabled, isBonus} = this.props;
    return {
      ...(!isDisabled && progressStyles.hoverStyle),
      ...progressStyles.levelProgressStyle(levelStatus, levelKind, isDisabled),
      ...(isDisabled && isBonus && styles.bonusDisabled)
    };
  }

  renderContent() {
    const {
      levelStatus,
      isUnplugged,
      isBonus,
      isPaired,
      title,
      bubbleSize
    } = this.props;
    if (bubbleSize === BubbleSize.dot) {
      return null;
    }
    const isLocked = levelStatus === LevelStatus.locked;
    return isUnplugged ? (
      <span>{i18n.unpluggedActivity()}</span>
    ) : isLocked ? (
      <FontAwesome icon="lock" />
    ) : isPaired ? (
      <FontAwesome icon="users" />
    ) : isBonus ? (
      <FontAwesome icon="flag-checkered" />
    ) : title ? (
      <span>{title}</span>
    ) : null;
  }

  render() {
    const {isUnplugged, isConcept, isDisabled, bubbleSize} = this.props;
    const bubbleShape = isUnplugged
      ? BubbleShape.pill
      : isConcept
      ? BubbleShape.diamond
      : BubbleShape.circle;

    const bubble = (
      <BasicBubble
        shape={bubbleShape}
        size={bubbleSize}
        progressStyle={this.progressStyle()}
      >
        {this.renderContent()}
      </BasicBubble>
    );

    if (isDisabled) {
      return bubble;
    }
    return <LinkWrapper {...this.props}>{bubble}</LinkWrapper>;
  }
}

export default Radium(ProgressTableLevelBubble);

export const unitTestExports = {
  DiamondContainer,
  BasicBubble,
  LinkWrapper
};
