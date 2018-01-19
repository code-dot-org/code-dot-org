import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import { updateQueryParam } from '../../utils';
import { reload } from '../../../utils';
import { selectSection, sectionsNameAndId, NO_SECTION } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const styles = {
  select: {
    width: 180
  }
};

class SectionSelector extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    // If false, the first option is "Select Section"
    requireSelection: PropTypes.bool,
    // If true, we'll show even if we don't have any locakable or hidden stages
    alwaysShow: PropTypes.bool,
    // If true, changing sections results in us hitting the server
    reloadOnChange: PropTypes.bool,

    // redux provided
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired
      })
    ).isRequired,
    selectedSectionId: PropTypes.string,
    selectSection: PropTypes.func.isRequired,
  };

  handleSelectChange = (event) => {
    const newSectionId = event.target.value;

    updateQueryParam('section_id', newSectionId === NO_SECTION ? undefined : newSectionId);
    if (this.props.reloadOnChange) {
      reload();
    } else {
      this.props.selectSection(newSectionId);
    }
  };

  render() {
    const {
      style,
      requireSelection,
      sections,
      selectedSectionId
    } = this.props;

    // No need to show section selector unless we have at least one section,
    if (sections.length === 0) {
      return null;
    }

    return (
      <select
        className="uitest-sectionselect"
        name="sections"
        style={{
          ...styles.select,
          ...style
        }}
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
}

export const UnconnectedSectionSelector = SectionSelector;

export default connect(state => ({
  selectedSectionId: state.teacherSections.selectedSectionId,
  sections: sectionsNameAndId(state.teacherSections),
}), dispatch => ({
  selectSection(sectionId) {
    dispatch(selectSection(sectionId));
  }
}))(SectionSelector);
