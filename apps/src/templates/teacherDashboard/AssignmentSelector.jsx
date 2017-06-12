import React, { Component, PropTypes } from 'react';

export default class AssignmentSelector extends Component {
  static propTypes = {
    //  TODO
    groupedValidAssignemnts: PropTypes.object.isRequired,
  };
  render() {
    const { groupedValidAssignemnts } = this.props;
    // TODO - default value
    return (
      <select>
        <option key="default" value=""/>
        {Object.keys(groupedValidAssignemnts).map((groupName, index) => (
          <optgroup key={index} label={groupName}>
            {groupedValidAssignemnts[groupName].map((assignment, index) => (
              <option key={index} value={assignment.assign_id}>{assignment.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }
}
