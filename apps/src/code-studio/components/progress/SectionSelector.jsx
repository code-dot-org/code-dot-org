import React from 'react';
import { connect } from 'react-redux';
import { selectSection, NO_SECTION } from '../../sectionsRedux';
import i18n from '@cdo/locale';
import { updateQueryParam } from '../../utils';

const styles = {
  select: {
    margin: 10,
    width: 180
  }
};

const SectionSelector = React.createClass({
  propTypes: {
    requireSelection: React.PropTypes.bool,
    onChange: React.PropTypes.func,

    // redux provided
    sections: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
      })
    ).isRequired,
    selectedSectionId: React.PropTypes.string,
    selectSection: React.PropTypes.func.isRequired
  },

  handleSelectChange(event) {
    const newSectionId = event.target.value;
    this.props.selectSection(newSectionId);

    updateQueryParam('section_id', newSectionId === NO_SECTION ? undefined : newSectionId);

    if (this.props.onChange) {
      this.props.onChange(newSectionId);
    }
  },

  render() {
    const { requireSelection, sections, selectedSectionId } = this.props;
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

export default connect(state => ({
  selectedSectionId: state.sections.selectedSectionId,
  sections: state.sections.sectionIds.map(id => ({
    name: state.sections.nameById.get(id),
    id
  }))
}), dispatch => ({
  selectSection(sectionId) {
    dispatch(selectSection(sectionId));
  }
}))(SectionSelector);
