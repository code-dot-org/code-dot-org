import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

// TODO: Can/should we share any logic with AssignmentSelector?

/**
 * Group our assignments into categories for our dropdown
 */
const groupedAssignments = assignments => (
  _(assignments)
    .values()
    .orderBy(['category_priority', 'category', 'position', 'name'])
    .groupBy('category')
    .value()
  );

export default class ScriptSelector extends Component {
  static propTypes = {
    validScripts: PropTypes.arrayOf(PropTypes.shape({
      // This shape is similar to that used by AssignmentSelector, but in that
      // case they've been semi-processed and given assignIds to diferentiate
      // courses and scripts
      category: PropTypes.string.isRequired,
      category_priority: PropTypes.number.isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      position: PropTypes.number,
    })).isRequired,
    scriptId: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { validScripts, scriptId, onChange } = this.props;

    const grouped = groupedAssignments(validScripts);

    return (
      <div>
        <select
          value={scriptId}
          onChange={event => onChange(event.target.value)}
        >
          <option key="default" value={''}/>
          {Object.keys(grouped).map((groupName, index) => (
            <optgroup key={index} label={groupName}>
              {grouped[groupName].map((assignment) => (
                (assignment !== undefined) &&
                  <option
                    key={assignment.id}
                    value={assignment.id}
                  >
                    {assignment.name}
                  </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }
}
