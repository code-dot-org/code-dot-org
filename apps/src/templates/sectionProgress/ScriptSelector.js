import React, { Component, PropTypes } from 'react';
import {validScriptPropType} from './sectionProgressRedux';
import _ from 'lodash';

// TODO: Can/should we share any logic with AssignmentSelector?

const styles = {
  dropdown: {
    width: 250,
    display: 'block',
    boxSizing: 'border-box',
    fontSize: 'medium',
    height: 34,
    paddingLeft: 5,
    paddingRight: 5
  },
};

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
    // This shape is similar to that used by AssignmentSelector, but in that
    // case they've been semi-processed and given assignIds to diferentiate
    // courses and scripts
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    scriptId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
  };

  render() {
    const { validScripts, scriptId, onChange } = this.props;

    const grouped = groupedAssignments(validScripts);

    return (
      <div>
        <select
          value={scriptId}
          onChange={event => onChange(parseInt(event.target.value))}
          style={styles.dropdown}
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
