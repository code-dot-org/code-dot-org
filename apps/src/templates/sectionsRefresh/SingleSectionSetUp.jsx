import React from 'react';
import PropTypes from 'prop-types';
import MultiSelectGroup from '@cdo/apps/templates/teacherDashboard/MultiSelectGroup';
import {StudentGradeLevels} from '@cdo/apps/util/sharedConstants';
import {queryParams} from '@cdo/apps/code-studio/utils';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection,
  isNewSection,
}) {
  const gradeOptions = StudentGradeLevels.map(g => ({label: g, value: g}));
  const participantType = isNewSection
    ? queryParams('participantType')
    : section.participantType;

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
      {participantType === ParticipantAudience.student && (
        <MultiSelectGroup
          label={i18n.chooseGrades()}
          name="grades"
          required={true}
          options={gradeOptions}
          values={section.grade || []}
          setValues={g => updateSection('grade', g)}
        />
      )}
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
  isNewSection: PropTypes.bool.isRequired,
};
