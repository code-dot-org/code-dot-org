import {Tooltip} from '@mui/material';
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
          <Tooltip title={i18n.hiddenScriptTooltip()} placement="top">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the control inside is disabled, so this wrapper is the only way to reach the reason */}
            <div tabIndex={0}>{toggle}</div>
          </Tooltip>
        ) : (
          <div>{toggle}</div>
        )}
      </TeacherInfoBox>
    );
  }
}
