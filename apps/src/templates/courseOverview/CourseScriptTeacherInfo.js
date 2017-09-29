import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import TeacherInfoBox from '@cdo/apps/templates/progress/TeacherInfoBox';
import HiddenForSectionToggle from '@cdo/apps/templates/progress/HiddenForSectionToggle';
import i18n from '@cdo/locale';

export default class CourseScriptTeacherInfo extends Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    isHidden: PropTypes.bool.isRequired,
    onToggleHiddenScript: PropTypes.func.isRequired,
  };

  render() {
    const { disabled, isHidden, onToggleHiddenScript } = this.props;

    // Note: Students should always have no (owned) sections
    const tooltipId = _.uniqueId();

    return (
      <TeacherInfoBox>
        <div
          data-tip
          data-for={tooltipId}
          aria-describedby={tooltipId}
        >
          <HiddenForSectionToggle
            hidden={isHidden}
            disabled={disabled}
            onChange={onToggleHiddenScript}
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
