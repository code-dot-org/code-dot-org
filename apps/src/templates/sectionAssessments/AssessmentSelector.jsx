import React, { Component, PropTypes } from 'react';
import { dropdownStyles } from '@cdo/apps/templates/sectionProgress/ScriptSelector';

export default class AssessmentSelector extends Component {
  static propTypes = {
    assessmentList: PropTypes.array.isRequired,
    assessmentId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { assessmentList, assessmentId, onChange } = this.props;

    return (
      <div>
        <select
          value={assessmentId}
          onChange={event => onChange(parseInt(event.target.value))}
          style={dropdownStyles.dropdown}
        >
          {Object.values(assessmentList).map((assessment, index) => (
            <option
              key={assessment.id}
              value={assessment.id}
            >
              {assessment.name}
            </option>
            ))
          }
        </select>
      </div>
    );
  }
}
