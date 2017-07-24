import React, { PropTypes, Component } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';
import { DOT_SIZE } from './progressStyles';

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

    const tooltipId = _.uniqueId();
    const icon = onStageExtras ? 'flag-checkered' : 'flag';
    return (
      <a
        href={stageExtrasUrl}
        style={{
          ...styles.main,
          ...(onStageExtras && styles.focused)
        }}
        data-tip data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <FontAwesome icon={icon}/>
        <TooltipWithIcon
          tooltipId={tooltipId}
          icon={icon}
          text={i18n.stageExtras()}
        />
      </a>
    );
  }
}

export default Radium(StageExtrasProgressDot);
