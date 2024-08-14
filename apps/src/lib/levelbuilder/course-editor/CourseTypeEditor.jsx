import PropTypes from 'prop-types';
import React from 'react';

import {
  InstructorAudience,
  ParticipantAudience,
  InstructionType,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import color from '@cdo/apps/util/color';

const INSTRUCTOR_AUDIENCE_DISPLAY_NAMES = {
  [InstructorAudience.teacher]: 'Teacher',
  [InstructorAudience.facilitator]: 'Facilitator',
  [InstructorAudience.universal_instructor]: 'Universal Instructor',
  [InstructorAudience.plc_reviewer]: 'PLC Reviewer',
};

const PARTICIPANT_AUDIENCE_DISPLAY_NAMES = {
  [ParticipantAudience.teacher]: 'Teacher',
  [ParticipantAudience.facilitator]: 'Facilitator',
  [ParticipantAudience.student]: 'Student',
};

const INSTRUCTION_TYPE_DISPLAY_NAMES = {
  [InstructionType.teacher_led]: 'Teacher Led',
  [InstructionType.self_paced]: 'Self Paced',
};

export default function CourseTypeEditor({
  instructorAudience,
  participantAudience,
  instructionType,
  handleInstructionTypeChange,
  handleInstructorAudienceChange,
  handleParticipantAudienceChange,
  allowMajorCurriculumChanges,
}) {
  return (
    <div>
      <CollapsibleEditorSection title="Course Type Settings">
        <label>
          Instruction Type
          <select
            className="instructionTypeSelector"
            value={instructionType}
            style={styles.dropdown}
            onChange={handleInstructionTypeChange}
            disabled={!allowMajorCurriculumChanges}
          >
            {Object.values(InstructionType).map(state => (
              <option key={state} value={state}>
                {INSTRUCTION_TYPE_DISPLAY_NAMES[state]}
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
                  <td style={styles.tableBorder}>Teacher Led</td>
                  <td style={styles.tableBorder}>
                    A course where a instructor is directing the learning for
                    participants in the course.
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableBorder}>Self Paced</td>
                  <td style={styles.tableBorder}>
                    A course where participants are progressing through the
                    course at their own pace.
                  </td>
                </tr>
              </tbody>
            </table>
          </HelpTip>
        </label>
        <label>
          Who will instruct this course?
          <select
            className="instructorAudienceSelector"
            value={instructorAudience}
            style={styles.dropdown}
            onChange={handleInstructorAudienceChange}
            disabled={!allowMajorCurriculumChanges}
          >
            {Object.values(InstructorAudience).map(audience => (
              <option key={audience} value={audience}>
                {INSTRUCTOR_AUDIENCE_DISPLAY_NAMES[audience]}
              </option>
            ))}
          </select>
          <HelpTip>
            <p>
              The Instructor is the person teaching the course. This setting
              will determine what information and features they can see in the
              course.
            </p>
          </HelpTip>
        </label>
        <label>
          Who will participate in this course?
          <select
            value={participantAudience}
            style={styles.dropdown}
            onChange={handleParticipantAudienceChange}
            disabled={!allowMajorCurriculumChanges}
          >
            {Object.values(ParticipantAudience).map(audience => (
              <option key={audience} value={audience}>
                {PARTICIPANT_AUDIENCE_DISPLAY_NAMES[audience]}
              </option>
            ))}
          </select>
          <HelpTip>
            <p>
              The Participant is the person being instructed in the course. This
              setting will determine what information they can see in the
              course.
            </p>
          </HelpTip>
        </label>
      </CollapsibleEditorSection>
    </div>
  );
}

CourseTypeEditor.propTypes = {
  instructorAudience: PropTypes.oneOf(Object.values(InstructorAudience))
    .isRequired,
  participantAudience: PropTypes.oneOf(Object.values(ParticipantAudience))
    .isRequired,
  instructionType: PropTypes.oneOf(Object.values(InstructionType)).isRequired,
  handleInstructionTypeChange: PropTypes.func,
  handleInstructorAudienceChange: PropTypes.func,
  handleParticipantAudienceChange: PropTypes.func,
  allowMajorCurriculumChanges: PropTypes.bool.isRequired,
};

const styles = {
  dropdown: {
    margin: '0 6px',
  },
  tableBorder: {
    border: '1px solid ' + color.white,
    padding: 5,
  },
};
