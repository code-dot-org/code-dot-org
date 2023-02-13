import React, {useState} from 'react';
import PropTypes from 'prop-types';
import MultiSelectGroup from '@cdo/apps/templates/teacherDashboard/MultiSelectGroup';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection
}) {
  const options = [
    'K',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
  ].map(g => ({label: g, value: g}));
  const [values, setValues] = useState(
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
        label="Pick at least one grade"
        name="grades"
        required={true}
        options={options}
        values={values}
        setValues={setValues}
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
