import React from 'react';
import PropTypes from 'prop-types';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';

export default function SetUpSectionForm({sectionNum}) {
  return (
    <div>
      <h2>{i18n.classSectionNum({num: sectionNum})}</h2>
      <label>
        {i18n.className()}
        <input type="text" className={moduleStyles.classNameTextField} />
      </label>
      <hr />
    </div>
  );
}

SetUpSectionForm.propTypes = {sectionNum: PropTypes.number.isRequired};
