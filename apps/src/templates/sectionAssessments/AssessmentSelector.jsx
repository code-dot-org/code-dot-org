import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {dropdownStyles} from '@cdo/apps/templates/sectionProgress/UnitSelector';

export default class AssessmentSelector extends Component {
  static propTypes = {
    assessmentList: PropTypes.array.isRequired,
    assessmentId: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };

  render() {
    const {assessmentList, assessmentId, onChange} = this.props;

    return (
      <div>
        <select
          id="assessment-selector"
          value={assessmentId}
          onChange={event => onChange(parseInt(event.target.value))}
          style={{...dropdownStyles.dropdown, width: 350}}
        >
          {Object.values(assessmentList).map((assessment, index) => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
