import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';
import {currentLocation} from '../../utils';
import FontAwesome from '../FontAwesome';
import color from '@cdo/apps/util/color';

const styles = {
  main: {
    color: color.white,
    width: 21,
    height: 24
  },
  focused: {
    color: '#32CD32'
  },
  hoverOverlay: {
    ':hover': {
      color: color.orange
    }
  }
};

class StageExtrasProgressBubble extends Component {
  static propTypes = {
    stageExtrasUrl: PropTypes.string.isRequired,
    onStageExtras: PropTypes.bool.isRequired
  };
  render() {
    const {stageExtrasUrl, onStageExtras} = this.props;

    const tooltipId = _.uniqueId();
    return (
      <a
        href={stageExtrasUrl + currentLocation().search}
        style={{
          ...styles.main
        }}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <div
          style={{
            ...styles.main,
            ...styles.hoverOverlay,
            ...(onStageExtras && styles.focused)
          }}
        >
          <FontAwesome icon="flag-checkered" />
        </div>
        <TooltipWithIcon
          tooltipId={tooltipId}
          icon={'flag-checkered'}
          text={i18n.stageExtras()}
          // Currently a stage extra can not also be an assessment so this should always be false
          // TODO (dmcavoy) : When we change the way we mark levels as assessment refactor
          includeAssessmentIcon={false}
        />
      </a>
    );
  }
}

export default Radium(StageExtrasProgressBubble);
