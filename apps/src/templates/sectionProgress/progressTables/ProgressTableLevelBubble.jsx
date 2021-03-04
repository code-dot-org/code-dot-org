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
    ...progressStyles.flex,
    width: progressStyles.LETTER_BUBBLE_SIZE,
    height: progressStyles.LETTER_BUBBLE_SIZE,
    borderRadius: progressStyles.LETTER_BUBBLE_SIZE,
    lineHeight: '12px',
    fontSize: 12,
    margin: progressStyles.LETTER_BUBBLE_MARGIN
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
    fontSize: 12,
    whiteSpace: 'nowrap'
  }
};

function levelStyle(props) {
  const {levelStatus, levelKind, disabled} = props;
  return {
    ...(!disabled && progressStyles.hoverStyle),
    ...progressStyles.levelProgressStyle(levelStatus, levelKind, disabled)
  };
}

function mainStyle(props) {
  return {
    ...styles.main,
    ...levelStyle(props)
  };
}

function largeStyle(props) {
  const {disabled, bonus} = props;
  return {
    ...mainStyle(props),
    ...styles.large,
    ...(disabled && bonus && styles.bonusDisabled)
  };
}

function largeContentStyle(props) {
  const {bonus, paired} = props;
  return {
    ...progressStyles.flex,
    ...styles.contents,
    fontSize: paired || bonus ? 14 : 16
  };
}

function UnpluggedBubble(props) {
  return (
    <div
      style={{
        ...styles.main,
        ...styles.unplugged,
        ...levelStyle(props)
      }}
    >
      <Content {...props} />
    </div>
  );
}

function SmallCircle(props) {
  return (
    <div style={{...mainStyle(props), ...styles.smallCircle}}>
      <Content {...props} />
    </div>
  );
}

function LargeBubble(props) {
  const BubbleType = props.concept ? LargeDiamond : LargeCircle;
  return (
    <div style={styles.container}>
      <BubbleType {...props} />
    </div>
  );
}
LargeBubble.propTypes = {
  concept: PropTypes.bool
};

function LargeCircle(props) {
  return (
    <div style={{...largeStyle(props), ...styles.largeCircle}}>
      <div style={largeContentStyle(props)}>
        <Content {...props} />
      </div>
    </div>
  );
}

function LargeDiamond(props) {
  return (
    <div style={{...largeStyle(props), ...styles.largeDiamond}}>
      <div style={{...largeContentStyle(props), ...styles.diamondContents}}>
        <Content {...props} />
      </div>
    </div>
  );
}

function Content(props) {
  const {levelStatus, unplugged, bonus, paired, title} = props;
  const locked = levelStatus === LevelStatus.locked;
  return unplugged ? (
    <span>{i18n.unpluggedActivity()}</span>
  ) : locked ? (
    <FontAwesome icon="lock" />
  ) : paired ? (
    <FontAwesome icon="users" />
  ) : bonus ? (
    <FontAwesome icon="flag-checkered" />
  ) : title ? (
    <span>{title}</span>
  ) : null;
}
Content.propTypes = {
  levelStatus: PropTypes.string,
  unplugged: PropTypes.bool,
  bonus: PropTypes.bool,
  paired: PropTypes.bool,
  title: PropTypes.string
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

  render() {
    const BubbleType = this.props.smallBubble
      ? SmallCircle
      : this.props.unplugged
      ? UnpluggedBubble
      : LargeBubble;

    const bubble = <BubbleType {...this.props} />;

    if (this.props.disabled) {
      return bubble;
    }
    return <LinkWrapper {...this.props}>{bubble}</LinkWrapper>;
  }
}

export default Radium(ProgressTableLevelBubble);

export const unitTestExports = {
  UnpluggedBubble,
  SmallCircle,
  LargeCircle,
  LargeDiamond,
  Content,
  LinkWrapper
};
