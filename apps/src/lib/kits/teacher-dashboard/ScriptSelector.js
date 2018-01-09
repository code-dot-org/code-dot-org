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
    // TODO: better detail shape?
    validScripts: PropTypes.array.isRequired,
    scriptId: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { validScripts, scriptId, onChange } = this.props;

    const grouped = groupedAssignments(validScripts);

    return (
      <div>
        <select
          id="uitest-primary-assignment"
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
