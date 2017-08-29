import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import TeacherInfoBox from '@cdo/apps/templates/progress/TeacherInfoBox';
import HiddenStageToggle from '@cdo/apps/templates/progress/HiddenStageToggle';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

export default class CourseScriptTeacherInfo extends Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    isHidden: PropTypes.bool.isRequired,
  };

  render() {
    const { disabled, isHidden } = this.props;
    if (!experiments.isEnabled('hidden-scripts')) {
      return null;
    }

    // Note: Students should always have no (owned) sections
    const tooltipId = _.uniqueId();

    return (
      <TeacherInfoBox>
        <div
          data-tip
          data-for={tooltipId}
          aria-describedby={tooltipId}
        >
          <HiddenStageToggle
            hidden={isHidden}
            disabled={disabled}
            onChange={() => console.log('change')}
          />
        </div>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
          disable={!disabled}
        >
          {i18n.hiddenScriptTooltip()}
        </ReactTooltip>
      </TeacherInfoBox>
    );
  }
}
