import React, { PropTypes, Component } from 'react';
import Radium from 'radium';
import _ from 'lodash';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';

const styles = {
  main: {
    backgroundImage: `url('${assetUrl("media/common_images/flag_inactive.png")}')`,
    width: 18,
    height: 21,
    ':hover': {
      //backgroundImage: `url('${assetUrl("media/common_images/flag_hover.png")}')`,
    },
    position: 'relative',
    top: -1,
  },
  focused: {
    backgroundImage: `url('${assetUrl("media/common_images/flag_active.png")}')`,
  }
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
        href={stageExtrasUrl}
        style={{
          ...styles.main,
          ...(onStageExtras && styles.focused)
        }}
        data-tip data-for={tooltipId}
        aria-describedby={tooltipId}
      >
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
