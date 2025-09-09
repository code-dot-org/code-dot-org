import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionsNameAndId} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {reload} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import style from './rubrics.module.scss';

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

    if (newSectionId === selectedSectionId) {
      return;
    }

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

  const selectedSection = sections.find(
    section => section.id === selectedSectionId
  );

  return (
    <CustomDropdown
      className={classnames(style.sectionSelector, 'uitest-sectionselect')}
      name="sections"
      size="s"
      styleAsFormField={true}
      selectedValueText={
        selectedSectionId ? selectedSection.name : i18n.selectSectionOption()
      }
    >
      <ul>
        {!selectedSectionId && (
          <li className={style.unselectableDropdownOption} key="select-section">
            <div className={style.dropdownOption}>
              <span>{i18n.selectSectionOption()}</span>
            </div>
          </li>
        )}
        {sections.map(({id, name}) => (
          <li>
            <button
              className={style.dropdownOption}
              type="button"
              onClick={() => handleSelectChange({value: id})}
            >
              <span>{name}</span>
            </button>
          </li>
        ))}
      </ul>
    </CustomDropdown>
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
