import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {FC} from 'react';

import aiTutorAvatar from '@cdo/static/tutor/ai-tutor-avatar.png';

import {ChallengeResponseDetail} from './types';

import styles from './project-view.module.scss';

interface AssessmentPanelProps {
  detail: ChallengeResponseDetail;
}

// "11:22AM Jun 22" — the timestamp on the feedback chat card.
const formatTimestamp = (isoDate: string) => {
  const date = new Date(isoDate);
  const time = date
    .toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})
    .replace(' ', '');
  const day = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${time} ${day}`;
};

const FeedbackCard: FC<{detail: ChallengeResponseDetail}> = ({detail}) => (
  <div className={styles.chatCard}>
    <div className={styles.chatHeader}>
      <div className={styles.chatAvatar}>
        <img src={aiTutorAvatar} alt="" />
      </div>
      <div className={styles.chatMeta}>
        <span className={styles.chatAuthor}>Tutor</span>
        <span className={styles.chatTimestamp}>
          {formatTimestamp(detail.evaluated_at || detail.created_at)}
        </span>
      </div>
    </div>
    <div className={styles.chatBody}>
      <p>{detail.student_feedback || 'Feedback isn’t ready yet.'}</p>
    </div>
  </div>
);

// The project page's side panel. Teachers see the AI assessment: the
// feedback sent to the student plus the challenge rubric with the
// AI-assigned level highlighted. The project's owner sees just the
// feedback. (Peers get no panel; the page doesn't render this for them.)
const AssessmentPanel: FC<AssessmentPanelProps> = ({detail}) => {
  const isTeacher = detail.viewer_role === 'teacher';
  const studentFirstName = detail.user_name.split(' ')[0];
  const assignedLevel = detail.evaluation_result?.level ?? null;

  if (!isTeacher) {
    return (
      <aside className={styles.panel}>
        <h2 className={styles.panelHeader}>Feedback</h2>
        <div className={styles.panelContent}>
          <FeedbackCard detail={detail} />
        </div>
      </aside>
    );
  }

  // Rubric levels are shown highest first, matching the design.
  const rubric = [...detail.rubric].sort((a, b) => b.level - a.level);

  return (
    <aside className={styles.panel}>
      <h2 className={styles.panelHeader}>AI Assessment</h2>
      <div className={styles.panelContent}>
        <section className={styles.panelSection}>
          <div className={styles.sectionLabelRow}>
            <h3 className={styles.sectionLabel}>Feedback</h3>
            <span className={styles.visibilityTag}>
              <FontAwesomeV6Icon iconName="eye" />
              Shown to {studentFirstName}
            </span>
          </div>
          <FeedbackCard detail={detail} />
        </section>
        {rubric.length > 0 && (
          <section className={styles.panelSection}>
            <div className={styles.sectionLabelRow}>
              <h3 className={styles.sectionLabel}>Rubric</h3>
              <span className={styles.visibilityTag}>
                <FontAwesomeV6Icon iconName="eye-slash" />
                Not shown to {studentFirstName}
              </span>
            </div>
            {rubric.map(entry => (
              <div
                key={entry.level}
                className={classNames(
                  styles.rubricItem,
                  entry.level === assignedLevel && styles.rubricItemAssigned
                )}
              >
                <div className={styles.rubricLevelRow}>
                  <span className={styles.rubricLevel}>
                    Level {entry.level}
                  </span>
                  {entry.level === assignedLevel && (
                    <span className={styles.assignedTag}>
                      AI Assigned Score
                    </span>
                  )}
                </div>
                <p>{entry.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </aside>
  );
};

export default AssessmentPanel;
