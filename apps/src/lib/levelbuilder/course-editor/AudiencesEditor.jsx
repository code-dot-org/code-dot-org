import PropTypes from 'prop-types';
import React from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {
  InstructorAudience,
  ParticipantAudience
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';

const INSTRUCTOR_AUDIENCE_DISPLAY_NAMES = {
  [InstructorAudience.teacher]: 'Teacher',
  [InstructorAudience.facilitator]: 'Facilitator',
  [InstructorAudience.code_instructor]: 'Code Instructor',
  [InstructorAudience.plc_reviewer]: 'PLC Reviewer'
};

const PARTICIPANT_AUDIENCE_DISPLAY_NAMES = {
  [ParticipantAudience.teacher]: 'Teacher',
  [ParticipantAudience.facilitator]: 'Facilitator',
  [ParticipantAudience.student]: 'Student'
};

export default function AudiencesEditor({
  instructorAudience,
  participantAudience,
  handleInstructorAudienceChange,
  handleParticipantAudienceChange
}) {
  return (
    <div>
      <CollapsibleEditorSection title="Audience Settings">
        <label>
          Who will instruct this course?
          <select
            className="instructorAudienceSelector"
            value={instructorAudience}
            style={styles.dropdown}
            onChange={handleInstructorAudienceChange}
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
            className="participantAudienceSelector"
            value={participantAudience}
            style={styles.dropdown}
            onChange={handleParticipantAudienceChange}
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

AudiencesEditor.propTypes = {
  instructorAudience: PropTypes.oneOf(Object.values(InstructorAudience))
    .isRequired,
  participantAudience: PropTypes.oneOf(Object.values(ParticipantAudience))
    .isRequired,
  handleInstructorAudienceChange: PropTypes.func,
  handleParticipantAudienceChange: PropTypes.func
};

const styles = {
  dropdown: {
    margin: '0 6px'
  }
};
