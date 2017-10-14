import React, {PropTypes} from 'react';
import { studentsShape } from './types';

/**
 * Section selector component, for students in multiple sections.
 */
export default class SectionSelector extends React.Component {
  static propTypes = {
    sections: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      students: studentsShape
    })),
    selectedSectionId: PropTypes.number,
    handleChange: PropTypes.func.isRequired,
  };

  render() {
    if (this.props.sections.length === 0 || this.props.sections.length === 1) {
      return null;
    }

    return (
      <select
        name="sectionId"
        value={this.props.selectedSectionId}
        onChange={this.props.handleChange}
      >
        <option key="blank" value="">Choose your section</option>
        {this.props.sections.map(section =>
          <option key={section.id} value={section.id}>{section.name}</option>
        )}
      </select>
    );
  }
}
