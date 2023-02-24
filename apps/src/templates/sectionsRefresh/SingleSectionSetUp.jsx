import React from 'react';
import PropTypes from 'prop-types';
import MultiSelectGroup from '@cdo/apps/templates/teacherDashboard/MultiSelectGroup';
import {StudentGradeLevels} from '@cdo/apps/util/sharedConstants';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection
}) {
  const gradeOptions = StudentGradeLevels.map(g => ({label: g, value: g}));

  return (
    <div>
      <h2>{i18n.classSection()}</h2>
      <label>
        {i18n.className()}
        <input
          required
          type="text"
          className={moduleStyles.classNameTextField}
          value={section.name}
          onChange={e => updateSection('name', e.target.value)}
        />
      </label>
      <MultiSelectGroup
        label={i18n.chooseGrades()}
        name="grades"
        required={true}
        options={gradeOptions}
        values={section.grades || []}
        setValues={g => updateSection('grades', g)}
      />
      <br />
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired
};
