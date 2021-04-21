import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import i18n from '@cdo/locale';
import {LevelKind} from '@cdo/apps/util/sharedConstants';
import {
  bubbleStyles,
  BubbleSize,
  BubbleShape,
  mainBubbleStyle,
  diamondContainerStyle,
  levelProgressStyle
} from '@cdo/apps/templates/progress/progressStyles';

/**
 * Our progress table displays thousands of bubbles. However, the vast majority
 * of those are duplicated in all aspects except the url they link to. Thus we
 * are able to improve rendering performance by caching the HTML for the
 * underlying `BasicBubble` to avoid recreating ones we already have.
 */
const bubbleHtmlCache = {};

/**
 * Top-level bubble component responsible for configuring BasicBubble based on
 * properties of a level and student progress.
 */
export default class ProgressTableLevelBubble extends React.PureComponent {
  static propTypes = {
    levelStatus: PropTypes.string,
    levelKind: PropTypes.string,
    isLocked: PropTypes.bool,
    isUnplugged: PropTypes.bool,
    isConcept: PropTypes.bool,
    isBonus: PropTypes.bool,
    isPaired: PropTypes.bool,
    bubbleSize: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
    title: PropTypes.string,
    url: PropTypes.string,
    useCache: PropTypes.bool
  };

  static defaultProps = {
    bubbleSize: BubbleSize.full
  };

  getBubbleShape() {
    return this.props.isUnplugged
      ? BubbleShape.pill
      : this.props.isConcept
      ? BubbleShape.diamond
      : BubbleShape.circle;
  }

  /**
   * We can't use our usual `progressStyles.hoverStyle` for hover effect here
   * because we can't use radium in our cached html, so instead we
   * conditionally add a CSS class to accomplish the same thing.
   */
  getClassNames() {
    return classNames('progress-bubble', {
      enabled: this.isEnabled()
    });
  }

  /**
   * Determines the simplest key to use for this bubble configuration.
   */
  getCacheKey() {
    const {
      isLocked,
      levelStatus,
      levelKind,
      isUnplugged,
      isBonus,
      isPaired,
      title,
      bubbleSize
    } = this.props;

    let statusString = `status=${levelStatus}`;
    if (levelKind === LevelKind.assessment) {
      statusString = `assessment:${statusString}`;
    }

    if (bubbleSize === BubbleSize.letter) {
      return `letter:title=${title}&${statusString}`;
    } else if (isUnplugged) {
      `unplugged:${statusString}`;
    }

    const shapeString = `shape=${this.getBubbleShape()}`;
    const contentString = isLocked
      ? `locked:`
      : isPaired
      ? `paired:`
      : isBonus
      ? `bonus:`
      : title
      ? `title=${title}`
      : null;

    return `${contentString}&${shapeString}&${statusString}`;
  }

  /**
   * Retrieve cached html if we have it, otherwise create and cache it.
   */
  getOrCreateHtml() {
    const cacheKey = this.getCacheKey();
    let bubbleHtml = bubbleHtmlCache[cacheKey];
    if (!bubbleHtml) {
      bubbleHtml = this.createHtml();
      bubbleHtmlCache[cacheKey] = bubbleHtml;
    }
    return bubbleHtml;
  }

  createHtml() {
    return ReactDOMServer.renderToStaticMarkup(this.createBubbleElement());
  }

  createBubbleElement() {
    return (
      <BasicBubble
        shape={this.getBubbleShape()}
        size={this.props.bubbleSize}
        progressStyle={levelProgressStyle(
          this.props.levelStatus,
          this.props.levelKind
        )}
        classNames="progress-bubble"
      >
        {this.renderContent()}
      </BasicBubble>
    );
  }

  renderContent() {
    const {isUnplugged, isBonus, isPaired, title, bubbleSize} = this.props;
    if (bubbleSize === BubbleSize.dot) {
      // dot-sized bubbles are too small for content
      return null;
    }
    return isUnplugged ? (
      <span>{i18n.unpluggedActivity()}</span>
    ) : this.isLocked() ? (
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
    let bubble;
    if (this.props.useCache) {
      const bubbleHtml = this.getOrCreateHtml();
      // eslint-disable-next-line react/no-danger
      bubble = <div dangerouslySetInnerHTML={{__html: bubbleHtml}} />;
    } else {
      bubble = this.createBubbleElement();
    }
    return <LinkWrapper url={this.props.url}>{bubble}</LinkWrapper>;
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
 * @param {string} classNames applies hover effect if enabled
 * @param {node} children the content to render inside the bubble
 */
function BasicBubble({shape, size, progressStyle, classNames, children}) {
  const bubbleStyle = mainBubbleStyle(shape, size, progressStyle);
  if (shape === BubbleShape.diamond) {
    return (
      <DiamondContainer
        size={size}
        bubbleStyle={bubbleStyle}
        classNames={classNames}
      >
        {children}
      </DiamondContainer>
    );
  }
  return (
    <div className={classNames} style={bubbleStyle}>
      {children}
    </div>
  );
}
BasicBubble.propTypes = {
  shape: PropTypes.oneOf(Object.values(BubbleShape)).isRequired,
  size: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  progressStyle: PropTypes.object,
  classNames: PropTypes.string,
  children: PropTypes.node
};

/**
 * Container applying rotation transforms and forcing diamond bubbles to have
 * the same size as circles.
 * @param {BubbleSize} size
 * @param {object} bubbleStyle contains rotation transform and progress style
 * @param {string} classNames applies hover effect if enabled
 * @param {node} children
 */
function DiamondContainer({size, bubbleStyle, classNames, children}) {
  return (
    /* Constrain size */
    <div style={diamondContainerStyle(size)}>
      {/* Apply rotation transform, progress style, and hover effect */}
      <div className={classNames} style={bubbleStyle}>
        {/* Undo the rotation from the parent */}
        <div style={bubbleStyles.diamondContentTransform}>{children}</div>
      </div>
    </div>
  );
}
DiamondContainer.propTypes = {
  size: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  bubbleStyle: PropTypes.object,
  classNames: PropTypes.string,
  children: PropTypes.node
};

function LinkWrapper({url, children}) {
  return (
    <a href={url} style={bubbleStyles.link}>
      {children}
    </a>
  );
}
LinkWrapper.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
};

export const unitTestExports = {
  DiamondContainer,
  BasicBubble,
  LinkWrapper
};
