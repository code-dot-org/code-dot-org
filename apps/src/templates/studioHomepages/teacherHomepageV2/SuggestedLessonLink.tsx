import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

interface SuggestedLesson {
  lesson_id: number;
  timestamp: string;
  name: string;
  url: string;
}

interface SuggestedLessonLinkProps {
  sectionId: number;
}

const SuggestedLessonLink: React.FC<SuggestedLessonLinkProps> = ({
  sectionId,
}) => {
  const [lesson, setLesson] = useState<SuggestedLesson | null>(null);

  useEffect(() => {
    HttpClient.fetchJson<SuggestedLesson | null>(
      `/api/v1/sections/${sectionId}/suggested_lesson`
    )
      .then(response => setLesson(response?.value ?? null))
      .catch(() => setLesson(null));
  }, [sectionId]);

  if (!lesson) return null;

  return (
    <a
      className={styles.taskButtons}
      href={lesson.url}
      target="_blank"
      rel="noreferrer"
    >
      <div className={styles.taskButtonLeft}>
        <FontAwesomeV6Icon
          className={styles.taskButtonIcons}
          iconName={'map'}
          iconStyle={'solid'}
        />
        <div>
          <Typography variant="body4" gutterBottom>
            {i18n.suggestedLesson()}
          </Typography>
          <Typography variant="body3" gutterBottom>
            {lesson.name}
          </Typography>
        </div>
      </div>
      <FontAwesomeV6Icon
        className={styles.taskButtonArrow}
        iconName={'arrow-right'}
        iconStyle={'solid'}
      />
    </a>
  );
};

export default SuggestedLessonLink;
