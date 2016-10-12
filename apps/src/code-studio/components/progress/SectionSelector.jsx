import React from 'react';
import { connect } from 'react-redux';
import { selectSection } from '../../sectionsRedux';

const styles = {
  select: {
    margin: 10,
    width: 180
  }
};

const SectionSelector = React.createClass({
  propTypes: {
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
    this.props.selectSection(event.target.value);
  },

  render() {
    const { sections, selectedSectionId } = this.props;
    return (
      <select
        name="sections"
        style={styles.select}
        value={selectedSectionId}
        onChange={this.handleSelectChange}
      >
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
