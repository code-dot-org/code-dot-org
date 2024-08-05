import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  selectSection,
  sectionsNameAndId,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {reload} from '../../../utils';
import {updateQueryParam} from '../../utils';

// Exported for unit testing
export const NO_SELECTED_SECTION_VALUE = '';

function SectionSelector({
  style,
  requireSelection,
  sections,
  selectedSectionId,
  logToFirehose,
  reloadOnChange,
  selectSection,
}) {
  const handleSelectChange = event => {
    const newSectionId = event.target.value;

    if (logToFirehose) {
      logToFirehose();
    }

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

  return (
    <select
      className="uitest-sectionselect"
      name="sections"
      aria-label={i18n.selectSection()}
      style={{
        ...styles.select,
        ...style,
      }}
      value={selectedSectionId || NO_SELECTED_SECTION_VALUE}
      onChange={handleSelectChange}
    >
      {!requireSelection && (
        <option
          key={NO_SELECTED_SECTION_VALUE}
          value={NO_SELECTED_SECTION_VALUE}
        >
          {i18n.selectSection()}
        </option>
      )}
      {sections.map(({id, name}) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
}

SectionSelector.propTypes = {
  style: PropTypes.object,
  // If false, the first option is "Select Section"
  requireSelection: PropTypes.bool,
  // If true, we'll show even if we don't have any lockable or hidden lessons
  alwaysShow: PropTypes.bool,
  // If true, changing sections results in us hitting the server
  reloadOnChange: PropTypes.bool,
  logToFirehose: PropTypes.func,

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

const styles = {
  select: {
    width: 180,
  },
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
