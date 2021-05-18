import React from 'react';
import PropTypes from 'prop-types';
import {LevelKind} from '@cdo/apps/util/sharedConstants';
import {BubbleSize} from '@cdo/apps/templates/progress/progressStyles';
import {
  BasicBubble,
  LinkWrapper,
  getBubbleContent,
  getBubbleClassNames,
  getBubbleShape
} from '@cdo/apps/templates/progress/BubbleFactory';
import CachedElement from '@cdo/apps/util/CachedElement';
import {levelProgressStyle} from '../../progress/progressStyles';

/**
 * Bubble component designed specifically for use in our section progress
 * table, responsible for configuring `BasicBubble` based on properties of a
 * level and student progress, and generating cache keys from same.
 *
 * Our progress table displays thousands of these bubbles. However, the vast
 * majority of them are duplicated in all aspects except the url they link to.
 * Thus we are able to improve rendering performance by caching the HTML for
 * the underlying `BasicBubble` to avoid recreating ones we already have.
 */
export default class ProgressTableLevelBubble extends React.PureComponent {
  /**
   * Note: if adding or removing props in this component, be sure to read the
   * comment for `getCacheKey` and update accordingly if necessary.
   */
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
    url: PropTypes.string
  };

  static defaultProps = {
    bubbleSize: BubbleSize.full
  };

  constructor(props) {
    super(props);
    this.createBubbleElement = this.createBubbleElement.bind(this);
  }

  render() {
    return (
      <LinkWrapper url={this.props.url}>
        <CachedElement
          elementType={'BasicBubble'}
          cacheKey={this.getCacheKey()}
          createElement={this.createBubbleElement}
        />
      </LinkWrapper>
    );
  }

  createBubbleElement() {
    const {
      levelStatus,
      levelKind,
      isLocked,
      isUnplugged,
      isConcept,
      isBonus,
      isPaired,
      title,
      bubbleSize
    } = this.props;
    const content = getBubbleContent(
      isLocked,
      isUnplugged,
      isBonus,
      isPaired,
      title,
      bubbleSize
    );
    return this.renderBasicBubble(
      getBubbleShape(isUnplugged, isConcept),
      bubbleSize,
      levelProgressStyle(levelStatus, levelKind),
      content
    );
  }

  /**
   * We use this helper as a testing hook to intercept the explicit props used
   * to render the `BasicBubble`.
   */
  renderBasicBubble(shape, size, progressStyle, content) {
    return (
      <BasicBubble
        shape={shape}
        size={size}
        progressStyle={progressStyle}
        classNames={getBubbleClassNames(true)}
      >
        {content}
      </BasicBubble>
    );
  }

  /**
   * Determines the simplest key to use for this bubble configuration.
   *
   * Note: a more general approach to cache key generation was considered, but
   * we found that taking advantage of our contextual knowledge of what makes a
   * key/bubble pair unique enables us to to optimize key length, which results
   * in a noticeable-enough performance improvement to warrant the additional
   * complexity here.
   *
   * However, that means future maintainers of this component will need to
   * think carefully about whether the addition or removal of props in this
   * component will require an update to this function.
   *
   * The general requirement is that if a property affects how the rendered
   * bubble will appear, it should be included in the key. That includes
   * properties related to shape and size, as well as anything passed into
   * `getProgressStyle` and `getBubbleContent`.
   */
  getCacheKey() {
    const {
      isLocked,
      levelStatus,
      levelKind,
      isUnplugged,
      isConcept,
      isBonus,
      isPaired,
      title,
      bubbleSize
    } = this.props;

    // sacrificing key readability for every little performance boost ("sts")
    let statusString = `sts=${levelStatus}`;

    // we need to explicitly specify if the level is an assessment, since
    // assessment bubbles are a different color than regular bubbles.
    if (levelKind === LevelKind.assessment) {
      statusString = `asmt:${statusString}`;
    }

    // letter bubbles and unplugged bubbles are all of the same shape and
    // content, so for those we can return a shorter key.
    if (bubbleSize === BubbleSize.letter) {
      return `ltr:ttl=${title}&${statusString}`;
    } else if (isUnplugged) {
      return `unp:${statusString}`;
    }

    // in the general case, we need to include all the properties that affect
    // the bubble's appearance in the cache key, which include the shape,
    // status, and all the props used to determine the content
    const shapeString = `shp=${getBubbleShape(isUnplugged, isConcept)}`;
    const contentString = isLocked
      ? `lkd:`
      : isPaired
      ? `prd:`
      : isBonus
      ? `bns:`
      : title
      ? `ttl=${title}`
      : null;

    return `${contentString}&${shapeString}&${statusString}`;
  }
}
