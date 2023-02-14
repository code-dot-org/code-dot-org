import React, {useState} from 'react';
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
  const options = StudentGradeLevels.map(g => ({label: g, value: g}));
  const [grades, setGrades] = useState(
    Object.fromEntries(options.map(o => [o.value, false]))
  );

  return (
    <div>
      <h2>{i18n.classSectionNum({num: sectionNum})}</h2>
      <label>
        {i18n.className()}
        <input
          type="text"
          className={moduleStyles.classNameTextField}
          value={section.name}
          onChange={e => updateSection('name', e.target.value)}
        />
      </label>
      <MultiSelectGroup
        label="Grade (choose at least one)"
        name="grades"
        required={true}
        options={options}
        values={grades}
        setValues={g => {
          updateSection('grades', g);
          setGrades(g);
        }}
      />
      <hr />
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired
};
