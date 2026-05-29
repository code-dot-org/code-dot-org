import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import HiddenForSectionToggle from '@cdo/apps/templates/progress/HiddenForSectionToggle';
import TeacherInfoBox from '@cdo/apps/templates/progress/TeacherInfoBox';
import i18n from '@cdo/locale';

export default class CourseScriptTeacherInfo extends Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    isHidden: PropTypes.bool.isRequired,
    onToggleHiddenScript: PropTypes.func.isRequired,
  };

  // Stable per-instance id so `aria-describedby` does not change between
  // renders and the tooltip doesn't re-mount unnecessarily.
  tooltipId = _.uniqueId('hidden-script-tooltip-');

  render() {
    const {disabled, isHidden, onToggleHiddenScript} = this.props;

    const toggle = (
      <HiddenForSectionToggle
        hidden={isHidden}
        disabled={disabled}
        onChange={onToggleHiddenScript}
      />
    );

    return (
      <TeacherInfoBox>
        {disabled ? (
          <WithTooltip
            tooltipProps={{
              text: i18n.hiddenScriptTooltip(),
              tooltipId: this.tooltipId,
            }}
          >
            <div>{toggle}</div>
          </WithTooltip>
        ) : (
          <div>{toggle}</div>
        )}
      </TeacherInfoBox>
    );
  }
}
