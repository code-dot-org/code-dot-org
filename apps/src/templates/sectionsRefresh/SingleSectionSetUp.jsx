import React from 'react';
import PropTypes from 'prop-types';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection
}) {
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
      <hr />
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired
};
