import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import i18n from '@cdo/locale';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {reload} from '@cdo/apps/utils';
import {
  selectSection,
  sectionsNameAndId,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import style from './rubrics.module.scss';
import classnames from 'classnames';

// Exported for unit testing
export const NO_SELECTED_SECTION_VALUE = '';

function SectionSelector({
  sections,
  selectedSectionId,
  logToFirehose,
  reloadOnChange,
  selectSection,
}) {
  const handleSelectChange = event => {
    const newSectionId = event.value;

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
    <Select
      clearable={false}
      searchable={false}
      className={classnames(style.sectionSelector, 'uitest-sectionselect')}
      name="sections"
      aria-label={i18n.selectSection()}
      value={selectedSectionId || NO_SELECTED_SECTION_VALUE}
      onChange={handleSelectChange}
      options={(!selectedSectionId
        ? [{value: NO_SELECTED_SECTION_VALUE, label: i18n.selectSection()}]
        : []
      ).concat(
        sections.map(({id, name}) => ({
          value: id,
          label: name,
        }))
      )}
    />
  );
}

SectionSelector.propTypes = {
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
