import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const styles = {
  container: {
    ...progressStyles.flex,
    width: progressStyles.BUBBLE_CONTAINER_WIDTH
  },
  main: {
    ...progressStyles.font,
    boxSizing: 'content-box',
    letterSpacing: -0.11,
    position: 'relative',
    margin: '3px 0px'
  },
  large: {
    ...progressStyles.flex,
    fontSize: 16
  },
  largeCircle: {
    width: progressStyles.DOT_SIZE,
    height: progressStyles.DOT_SIZE,
    borderRadius: progressStyles.DOT_SIZE
  },
  largeDiamond: {
    width: progressStyles.DIAMOND_DOT_SIZE,
    height: progressStyles.DIAMOND_DOT_SIZE,
    borderRadius: 4,
    transform: 'rotate(45deg)',
    margin: '6px 0px'
  },
  smallCircle: {
    ...progressStyles.inlineBlock,
    width: progressStyles.LETTER_BUBBLE_SIZE,
    height: progressStyles.LETTER_BUBBLE_SIZE,
    borderRadius: progressStyles.LETTER_BUBBLE_SIZE,
    lineHeight: '12px',
    fontSize: 12,
    margin: progressStyles.LETTER_BUBBLE_MARGIN,
    paddingRight: progressStyles.LETTER_BUBBLE_PAD,
    paddingBottom: progressStyles.LETTER_BUBBLE_PAD,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  contents: {
    whiteSpace: 'nowrap',
    lineHeight: '16px'
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
  bonusDisabled: {
    backgroundColor: color.lighter_gray,
    color: color.white
  },
  unplugged: {
    ...progressStyles.flex,
    borderRadius: 20,
    padding: '6px 10px',
    fontSize: 12
  }
};

class ProgressTableLevelBubble extends React.PureComponent {
  static propTypes = {
    levelStatus: PropTypes.string,
    levelKind: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    unplugged: PropTypes.bool,
    smallBubble: PropTypes.bool,
    bonus: PropTypes.bool,
    paired: PropTypes.bool,
    concept: PropTypes.bool,
    title: PropTypes.string,
    url: PropTypes.string.isRequired
  };

  levelStyle() {
    const {levelStatus, levelKind, disabled} = this.props;
    return {
      ...(!disabled && progressStyles.hoverStyle),
      ...progressStyles.levelProgressStyle(levelStatus, levelKind, disabled)
    };
  }

  mainStyle() {
    return {
      ...styles.main,
      ...this.levelStyle()
    };
  }

  largeStyle() {
    const {disabled, bonus, concept} = this.props;
    return {
      ...this.mainStyle(),
      ...styles.large,
      ...((concept && styles.largeDiamond) || styles.largeCircle),
      ...(disabled && bonus && styles.bonusDisabled)
    };
  }

  renderUnplugged() {
    return (
      <div
        style={{
          ...styles.main,
          ...styles.unplugged,
          ...this.levelStyle()
        }}
      >
        {i18n.unpluggedActivity()}
      </div>
    );
  }

  renderSmallBubble() {
    const {title} = this.props;
    return (
      <div>
        <div style={{...this.mainStyle(), ...styles.smallCircle}}>{title}</div>
      </div>
    );
  }

  content() {
    const {levelStatus, bonus, paired, title} = this.props;
    const locked = levelStatus === LevelStatus.locked;
    return locked ? (
      <FontAwesome icon="lock" />
    ) : paired ? (
      <FontAwesome icon="users" />
    ) : bonus ? (
      <FontAwesome icon="flag-checkered" />
    ) : title ? (
      title
    ) : (
      ''
    );
  }

  renderLargeBubble() {
    const {bonus, paired, concept} = this.props;
    return (
      <div style={styles.container}>
        <div style={this.largeStyle()}>
          <div
            style={{
              ...progressStyles.flex,
              ...styles.contents,
              ...(concept && styles.diamondContents),
              fontSize: paired || bonus ? 14 : 16
            }}
          >
            {this.content()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const bubble = this.props.smallBubble
      ? this.renderSmallBubble()
      : this.props.unplugged
      ? this.renderUnplugged()
      : this.renderLargeBubble();

    if (this.props.disabled) {
      return bubble;
    }
    return (
      <a href={this.props.url} style={progressStyles.link}>
        {bubble}
      </a>
    );
  }
}

export default Radium(ProgressTableLevelBubble);
