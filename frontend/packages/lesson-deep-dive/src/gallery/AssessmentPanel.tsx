import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ChallengeResponseDetail} from './types';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import {FC} from 'react';

import aiTutorAvatar from './ai-tutor-avatar.png';

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
        <Typography
          variant="label2"
          component="span"
          className={styles.chatAuthor}
        >
          Tutor
        </Typography>
        <Typography
          variant="body4"
          component="span"
          className={styles.chatTimestamp}
        >
          {formatTimestamp(detail.evaluated_at || detail.created_at)}
        </Typography>
      </div>
    </div>
    <div className={styles.chatBody}>
      <Typography variant="body4">
        {detail.student_feedback || 'Feedback isn’t ready yet.'}
      </Typography>
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
        <Typography
          variant="overline2"
          component="h2"
          className={styles.panelHeader}
        >
          Feedback
        </Typography>
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
      <Typography
        variant="overline2"
        component="h2"
        className={styles.panelHeader}
      >
        AI Assessment
      </Typography>
      <div className={styles.panelContent}>
        <section className={styles.panelSection}>
          <div className={styles.sectionLabelRow}>
            <Typography
              variant="overline2"
              component="h3"
              className={styles.sectionLabel}
            >
              Feedback
            </Typography>
            <Typography
              variant="label3"
              component="span"
              className={styles.visibilityTag}
            >
              <FontAwesomeV6Icon iconName="eye" />
              Shown to {studentFirstName}
            </Typography>
          </div>
          <FeedbackCard detail={detail} />
        </section>
        {rubric.length > 0 && (
          <section className={styles.panelSection}>
            <div className={styles.sectionLabelRow}>
              <Typography
                variant="overline2"
                component="h3"
                className={styles.sectionLabel}
              >
                Rubric
              </Typography>
              <Typography
                variant="label3"
                component="span"
                className={styles.visibilityTag}
              >
                <FontAwesomeV6Icon iconName="eye-slash" />
                Not shown to {studentFirstName}
              </Typography>
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
                  <Typography
                    variant="label3"
                    component="span"
                    className={styles.rubricLevel}
                  >
                    Level {entry.level}
                  </Typography>
                  {entry.level === assignedLevel && (
                    <Typography
                      variant="label3"
                      component="span"
                      className={styles.assignedTag}
                    >
                      AI Assigned Score
                    </Typography>
                  )}
                </div>
                <Typography variant="body4">{entry.description}</Typography>
              </div>
            ))}
          </section>
        )}
      </div>
    </aside>
  );
};

export default AssessmentPanel;
