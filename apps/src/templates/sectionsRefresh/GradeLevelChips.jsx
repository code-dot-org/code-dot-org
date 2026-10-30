import Chips from '@code-dot-org/component-library/chips';
import PropTypes from 'prop-types';
import React from 'react';

import {StudentGradeLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import moduleStyles from './sections-refresh.module.scss';

export default function GradeLevelChips({
  values,
  setValues,
  disabled = false,
  inputLabel = i18n.chooseGrades(),
  className,
}) {
  const gradeOptions = StudentGradeLevels.map(g => ({label: g, value: g}));

  return (
    <div className={moduleStyles.containerWithMarginTop}>
      <Chips
        label={inputLabel}
        name="grades"
        required={true}
        requiredMessageText={i18n.chooseAtLeastOne()}
        options={gradeOptions}
        values={values || []}
        setValues={setValues}
        disabled={disabled}
        className={className}
      />
    </div>
  );
}

GradeLevelChips.propTypes = {
  values: PropTypes.array,
  setValues: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  inputLabel: PropTypes.string,
  className: PropTypes.string,
};
