import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import PropTypes from 'prop-types';
import React from 'react';

import {sortSectionsList} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import {studentsShape} from './types';

/**
 * Section selector component, for students in multiple sections.
 */
export default function SectionSelector({
  sections,
  selectedSectionId,
  handleChange,
}) {
  if (sections.length === 0 || sections.length === 1) {
    return null;
  }

  const sortedSections = sortSectionsList(sections);
  const items = [
    {value: '', text: i18n.chooseSection()},
    ...sortedSections.map(section => ({
      value: String(section.id),
      text: section.name,
    })),
  ];

  return (
    <SimpleDropdown
      name="sectionId"
      labelText={i18n.chooseSection()}
      isLabelVisible={false}
      items={items}
      selectedValue={String(selectedSectionId ?? '')}
      onChange={handleChange}
    />
  );
}

SectionSelector.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      students: studentsShape,
    })
  ),
  selectedSectionId: PropTypes.number,
  handleChange: PropTypes.func.isRequired,
};
