import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {
  bubbleStyles,
  BubbleSize,
  BubbleShape,
  mainBubbleStyle,
  diamondContainerStyle,
  getProgressStyle
} from '@cdo/apps/templates/progress/progressStyles';

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
    bubbleSize: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
    title: PropTypes.string,
    url: PropTypes.string
  };

  static defaultProps = {
    bubbleSize: BubbleSize.full
  };

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
      // dot-sized bubbles are too small for content
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
        progressStyle={getProgressStyle(this.props)}
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

/**
 * Base bubble component defined in terms of shape, size, and style, as opposed
 * to level-related properties. This component is itself only an empty styled
 * container, and expects the bubble content (e.g. level number, icon, text) to
 * be passed in as its children.
 * @param {BubbleShape} shape
 * @param {BubbleSize} size
 * @param {object} progressStyle contains border and background colors
 * @param {node} children the content to render inside the bubble
 */
function BasicBubble({shape, size, progressStyle, children}) {
  const bubbleStyle = mainBubbleStyle(shape, size, progressStyle);
  if (shape === BubbleShape.diamond) {
    return (
      <DiamondContainer size={size} bubbleStyle={bubbleStyle}>
        {children}
      </DiamondContainer>
    );
  }
  return <div style={bubbleStyle}>{children}</div>;
}
BasicBubble.propTypes = {
  shape: PropTypes.oneOf(Object.values(BubbleShape)).isRequired,
  size: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  progressStyle: PropTypes.object,
  children: PropTypes.node
};

/**
 * Container applying rotation transforms and forcing diamond bubbles to have
 * the same size as circles.
 * @param {BubbleSize} size
 * @param {object} bubbleStyle contains rotation transform and progress style
 * @param {node} children
 */
function DiamondContainer({size, bubbleStyle, children}) {
  return (
    /* Constrain size */
    <div style={diamondContainerStyle(size)}>
      {/* Apply rotation transform and progress style */}
      <div style={bubbleStyle}>
        {/* Undo the rotation from the parent */}
        <div style={bubbleStyles.diamondContentTransform}>{children}</div>
      </div>
    </div>
  );
}
DiamondContainer.propTypes = {
  size: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  bubbleStyle: PropTypes.object,
  children: PropTypes.node
};

function LinkWrapper(props) {
  return (
    <a href={props.url} style={bubbleStyles.link}>
      {props.children}
    </a>
  );
}
LinkWrapper.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
};

export default Radium(ProgressTableLevelBubble);

export const unitTestExports = {
  DiamondContainer,
  BasicBubble,
  LinkWrapper
};
