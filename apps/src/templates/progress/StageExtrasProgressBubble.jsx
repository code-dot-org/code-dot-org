import React, { PropTypes, Component } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';
import { currentLocation } from '../../utils';

const styles = {
  main: {
    backgroundImage: `url('${assetUrl("media/common_images/flag_inactive.png")}')`,
    width: 21,
    height: 24,
  },
  focused: {
    backgroundImage: `url('${assetUrl("media/common_images/flag_active.png")}')`,
  },
  hoverOverlay: {
    backgroundImage: `url('${assetUrl("media/common_images/flag_hover.png")}')`,
    opacity: 0,
    transition: 'opacity .2s ease-out',
    ':hover': {
      opacity: 1,
    },
  },
};

class StageExtrasProgressBubble extends Component {
  static propTypes = {
    stageExtrasUrl: PropTypes.string.isRequired,
    onStageExtras: PropTypes.bool.isRequired,
  };
  render() {
    const { stageExtrasUrl, onStageExtras } = this.props;

    const tooltipId = _.uniqueId();
    return (
      <a
        href={stageExtrasUrl + currentLocation().search}
        style={{
          ...styles.main,
          ...(onStageExtras && styles.focused)
        }}
        data-tip data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <div style={{...styles.main, ...styles.hoverOverlay}}/>
        <TooltipWithIcon
          tooltipId={tooltipId}
          icon={'flag'}
          text={i18n.stageExtras()}
        />
      </a>
    );
  }
}

export default Radium(StageExtrasProgressBubble);
