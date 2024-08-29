import PropTypes from 'prop-types';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import Chips from '@cdo/apps/componentLibrary/chips';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {StudentGradeLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import moduleStyles from './sections-refresh.module.scss';

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
      <div className={moduleStyles.containerWithMarginTop}>
        <Heading2>{i18n.classSection()}</Heading2>
        <label className={moduleStyles.typographyLabelTwo}>
          {i18n.className()}
          <input
            required
            type="text"
            id="uitest-section-name-setup"
            className={moduleStyles.classNameTextField}
            value={section.name}
            onChange={e => updateSection('name', e.target.value)}
          />
        </label>
      </div>
      {participantType === ParticipantAudience.student && (
        <div className={moduleStyles.containerWithMarginTop}>
          <Chips
            label={i18n.chooseGrades()}
            name="grades"
            required={true}
            options={gradeOptions}
            values={section.grade || section.grades || []}
            setValues={g => updateSection('grade', g)}
          />
        </div>
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
