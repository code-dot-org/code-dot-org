import React from 'react';
import { studentsShape } from './types';

/**
 * Section selector component, for students in multiple sections.
 */
const SectionSelector = React.createClass({
  propTypes: {
    sections: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
      name: React.PropTypes.string,
      students: studentsShape
    })),
    selectedSectionId: React.PropTypes.number,
    handleChange: React.PropTypes.func.isRequired,
  },

  handleChange(event) {
    this.props.handleChange(event);
  },

  render() {
    if (this.props.sections.length === 0 || this.props.sections.length === 1) {
      return null;
    }

    return (
      <select
        name="sectionId"
        value={this.props.selectedSectionId}
        onChange={this.handleChange}
      >
        <option key="blank" value="">Choose your section</option>
        {this.props.sections.map(section =>
          <option key={section.id} value={section.id}>{section.name}</option>
        )}
      </select>
    );
  }
});
export default SectionSelector;
