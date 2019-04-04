import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import FontAwesome from '../FontAwesome';
import {DOT_SIZE} from './progressStyles';
import experiments from '@cdo/apps/util/experiments';

const styles = {
  tooltip: {
    lineHeight: DOT_SIZE + 'px'
  },
  tooltipIcon: {
    paddingRight: 5,
    paddingLeft: 5
  },
  tooltipAssessmentIcon: {
    paddingLeft: 5
  }
};

/**
 * A simple tooltip that contains an icon and text. To use, you must still associate
 * the tooltip id with the element you want to get this tooltip, ie.
 * <Foo data-tip data-for={tooltipId}/>
 */
export default class TooltipWithIcon extends Component {
  static propTypes = {
    tooltipId: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    includeAssessmentIcon: PropTypes.bool
  };
  render() {
    const {tooltipId, icon, text, includeAssessmentIcon} = this.props;
    return (
      <ReactTooltip id={tooltipId} role="tooltip" wrapper="span" effect="solid">
        <div style={styles.tooltip}>
          {experiments.isEnabled(experiments.MINI_RUBRIC_2019) &&
            includeAssessmentIcon && (
              <FontAwesome
                icon="check-circle"
                style={styles.tooltipAssessmentIcon}
              />
            )}
          <FontAwesome icon={icon} style={styles.tooltipIcon} />
          {text}
        </div>
      </ReactTooltip>
    );
  }
}
