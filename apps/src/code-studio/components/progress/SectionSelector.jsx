import React from 'react';
import { connect } from 'react-redux';
import { selectSection } from '../../stageLockRedux';

const styles = {
  select: {
    margin: 10,
    width: 180
  }
};

const SectionSelector = React.createClass({
  propTypes: {
    sections: React.PropTypes.objectOf(
      React.PropTypes.shape({
        section_name: React.PropTypes.string.isRequired
      })
    ).isRequired,
    selectedSection: React.PropTypes.string,
    selectSection: React.PropTypes.func.isRequired
  },

  handleSelectChange(event) {
    this.props.selectSection(event.target.value);
  },

  render() {
    const { sections, selectedSection } = this.props;
    return (
      <select
        name="sections"
        style={styles.select}
        value={selectedSection}
        onChange={this.handleSelectChange}
      >
        {Object.keys(sections).map(id => (
          <option key={id} value={id}>
            {sections[id].section_name}
          </option>
        ))}
      </select>
    );
  }
});

export default connect(state => ({
  selectedSection: state.stageLock.selectedSection,
  sections: state.stageLock.sections
}), dispatch => ({
  selectSection(sectionId) {
    dispatch(selectSection(sectionId));
  }
}))(SectionSelector);
