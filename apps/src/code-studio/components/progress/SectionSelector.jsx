import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionsNameAndId} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import {reload} from '../../../utils';
import {updateQueryParam} from '../../utils';

// Exported for unit testing
export const NO_SELECTED_SECTION_VALUE = '';

function SectionSelector({
  className,
  requireSelection,
  sections,
  selectedSectionId,
  reloadOnChange,
  selectSection,
}) {
  const handleSelectChange = event => {
    const newSectionId = event.target.value;

    updateQueryParam(
      'section_id',
      newSectionId === NO_SELECTED_SECTION_VALUE ? undefined : newSectionId
    );
    // If we have a user_id when we switch sections we should get rid of it
    updateQueryParam('user_id', undefined);
    if (reloadOnChange) {
      reload();
    } else {
      selectSection(newSectionId);
    }
  };

  // No need to show section selector unless we have at least one section,
  if (sections.length === 0) {
    return null;
  }

  const items = (
    requireSelection
      ? []
      : [{value: NO_SELECTED_SECTION_VALUE, text: i18n.selectSection()}]
  ).concat(sections.map(({id, name}) => ({value: String(id), text: name})));

  return (
    <SimpleDropdown
      className={classNames('uitest-sectionselect', className)}
      name="sections"
      size="s"
      labelText={i18n.selectSection()}
      isLabelVisible={false}
      items={items}
      selectedValue={String(selectedSectionId || NO_SELECTED_SECTION_VALUE)}
      onChange={handleSelectChange}
    />
  );
}

SectionSelector.propTypes = {
  className: PropTypes.string,
  // If false, the first option is "Select Section"
  requireSelection: PropTypes.bool,
  // If true, we'll show even if we don't have any lockable or hidden lessons
  alwaysShow: PropTypes.bool,
  // If true, changing sections results in us hitting the server
  reloadOnChange: PropTypes.bool,

  // redux provided
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedSectionId: PropTypes.number,
  selectSection: PropTypes.func.isRequired,
};

export const UnconnectedSectionSelector = SectionSelector;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId,
    sections: sectionsNameAndId(state.teacherSections),
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    },
  })
)(SectionSelector);
