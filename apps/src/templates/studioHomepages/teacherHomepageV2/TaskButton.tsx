import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {TEACHER_NAVIGATION_SECTIONS_URL} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';

import styles from './teacherHomepage.module.scss';

interface TaskButtonProps {
  buttonText: string;
  icon: string;
  sectionId: number;
  path: string;
}

export const TaskButton: React.FC<TaskButtonProps> = ({
  buttonText,
  icon,
  sectionId,
  path,
}) => {
  const navigate = useNavigate();

  return (
    <button
      type={'button'}
      className={styles.taskButtons}
      onClick={() =>
        navigate(`${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${path}`)
      }
    >
      <div className={styles.taskButtonLeft}>
        <FontAwesomeV6Icon
          className={styles.taskButtonIcons}
          iconName={icon}
          iconStyle={'solid'}
        />
        <BodyThreeText>{buttonText}</BodyThreeText>
      </div>
      <FontAwesomeV6Icon
        className={styles.taskButtonArrow}
        iconName={'arrow-right'}
        iconStyle={'solid'}
      />
    </button>
  );
};
