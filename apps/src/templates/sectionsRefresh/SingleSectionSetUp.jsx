import React from 'react';
import PropTypes from 'prop-types';
import MultiSelectGroup from '@cdo/apps/templates/teacherDashboard/MultiSelectGroup';
import {StudentGradeLevels} from '@cdo/apps/util/sharedConstants';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';
import {Heading2} from '@cdo/apps/componentLibrary/typography';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection,
}) {
  const gradeOptions = StudentGradeLevels.map(g => ({label: g, value: g}));

  return (
    <div>
      <div className={moduleStyles.containerWithMarginTop}>
        <Heading2>{i18n.classSection()}</Heading2>
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
      </div>
      <div className={moduleStyles.containerWithMarginTop}>
        <MultiSelectGroup
          required
          label={i18n.chooseGrades()}
          name="grades"
          options={gradeOptions}
          values={section.grades || []}
          setValues={g => updateSection('grades', g)}
        />
      </div>
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
};
