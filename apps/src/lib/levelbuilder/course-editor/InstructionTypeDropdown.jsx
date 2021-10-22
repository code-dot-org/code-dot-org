import PropTypes from 'prop-types';
import React from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';
import {InstructionType} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

export default function InstructionTypeDropdown({
  instructionType,
  handleInstructionTypeChange
}) {
  return (
    <div>
      <label>
        Instruction Type
        <select
          className="instructionTypeSelector"
          value={instructionType}
          style={styles.dropdown}
          onChange={handleInstructionTypeChange}
        >
          {Object.values(InstructionType).map(state => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <HelpTip>
          <table>
            <thead>
              <tr>
                <th>Instruction Type</th>
                <th>Overview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tableBorder}>Teacher-Led</td>
                <td style={styles.tableBorder}>
                  A course where a instructor is directing the learning for
                  participants in the course.
                </td>
              </tr>
              <tr>
                <td style={styles.tableBorder}>Self-Paced</td>
                <td style={styles.tableBorder}>
                  A course where participants are progressing through the course
                  at their own pace.
                </td>
              </tr>
            </tbody>
          </table>
        </HelpTip>
      </label>
    </div>
  );
}

InstructionTypeDropdown.propTypes = {
  instructionType: PropTypes.oneOf(Object.values(InstructionType)).isRequired,
  handleInstructionTypeChange: PropTypes.func
};

const styles = {
  dropdown: {
    margin: '0 6px'
  },
  tableBorder: {
    border: '1px solid ' + color.white,
    padding: 5
  }
};
