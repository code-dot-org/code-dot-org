import React, { PropTypes, Component } from 'react';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "@cdo/apps/util/color";
// TODO - should this be in progressStyles?
import { DOT_SIZE } from './NewProgressBubble';

const styles = {
  main: {
    display: 'inline-block',
    lineHeight: DOT_SIZE + 'px',
    paddingLeft: 2,
    fontSize: 12,
    color: color.light_gray,
    ':hover': {
      color: color.orange
    },
  },
  focused: {
    color: color.charcoal,
    fontSize: 30,
    // to center properly
    position: 'relative',
    top: 5
  }
};

// TODO: rename
class StageExtrasProgressDot extends Component {
  static propTypes = {
    stageExtrasUrl: PropTypes.string.isRequired,
    onStageExtras: PropTypes.bool.isRequired,
  };
  render() {
    const { stageExtrasUrl, onStageExtras } = this.props;
    // TODO: tooltip
    return (
      <a
        href={stageExtrasUrl}
        style={{
          ...styles.main,
          ...(onStageExtras && styles.focused)
        }}
      >
          <FontAwesome icon={onStageExtras ? 'flag-checkered' : 'flag'}/>
      </a>
    );
  }
}

export default Radium(StageExtrasProgressDot);
