import React from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import { updateQueryParam } from '../../utils';
import { hasLockableStages } from '@cdo/apps/code-studio/progressRedux';
import { selectSection, sectionsNameAndId, NO_SECTION } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const styles = {
  select: {
    width: 180
  }
};

const SectionSelector = React.createClass({
  propTypes: {
    // If false, the first option is "Select Section"
    requireSelection: React.PropTypes.bool,
    // If true, we'll show even if we don't have any locakable or hidden stages
    alwaysShow: React.PropTypes.bool,
    // If true, changing sections results in us hitting the server
    reloadOnChange: React.PropTypes.bool,

    // redux provided
    sections: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.number.isRequired
      })
    ).isRequired,
    selectedSectionId: React.PropTypes.string,
    scriptHasLockableStages: React.PropTypes.bool.isRequired,
    scriptAllowsHiddenStages: React.PropTypes.bool.isRequired,
    selectSection: React.PropTypes.func.isRequired,
  },

  handleSelectChange(event) {
    const newSectionId = event.target.value;

    updateQueryParam('section_id', newSectionId === NO_SECTION ? undefined : newSectionId);
    if (this.props.reloadOnChange) {
      window.location.reload();
    } else {
      this.props.selectSection(newSectionId);
    }
  },

  render() {
    const {
      requireSelection,
      alwaysShow,
      sections,
      selectedSectionId,
      scriptHasLockableStages,
      scriptAllowsHiddenStages
    } = this.props;

    // No need to show section selector unless we have at least one section,
    if (sections.length === 0) {
      return null;
    }

    // By default, we won't show the SectionSelector unless we have either lockable
    // stages in this script, or the script allows hidden stages. If alwaysShow
    // is true, we want to show it regardless
    if (!alwaysShow && !scriptHasLockableStages && !scriptAllowsHiddenStages) {
      return null;
    }

    return (
      <select
        className="uitest-sectionselect"
        name="sections"
        style={styles.select}
        value={selectedSectionId}
        onChange={this.handleSelectChange}
      >
        {!requireSelection &&
          <option key={''} value={''}>{i18n.selectSection()}</option>
        }
        {sections.map(({id, name}) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    );
  }
});

export const UnconnectedSectionSelector = SectionSelector;

export default connect(state => ({
  selectedSectionId: state.teacherSections.selectedSectionId,
  sections: sectionsNameAndId(state.teacherSections),
  scriptHasLockableStages: state.stageLock.lockableAuthorized && hasLockableStages(state.progress),
  scriptAllowsHiddenStages: state.hiddenStage.get('hideableAllowed'),
}), dispatch => ({
  selectSection(sectionId) {
    dispatch(selectSection(sectionId));
  }
}))(SectionSelector);
