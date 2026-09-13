import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React, {useState} from 'react';

import InstantSectionCodeModal from '@cdo/apps/templates/instantSection/InstantSectionCodeModal';
import InstantSectionCourseAssignModal from '@cdo/apps/templates/instantSection/InstantSectionCourseAssignModal';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import {CourseContentDropdown} from './CourseContentDropdown';
import {EmptyStateButton} from './EmptyStateButton';
import SuggestedLessonLink from './SuggestedLessonLink';
import {TaskButton} from './TaskButton';

import styles from './teacherHomepage.module.scss';

interface SectionCardBodyProps {
  section: Section;
}

const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [showCourseRecommendations, setShowCourseRecommendations] =
    useState(false);

  return (
    <div className={styles.sectionCardBody}>
      <div className={styles.sectionCardBodyLeft}>
        {section.courseId && section.isInstantSection ? (
          <TaskButton
            buttonText={`${i18n.course()}: ${section.courseDisplayName}`}
            icon="desktop"
            sectionId={section.id}
            sectionName={section.name}
            path={`courses/${section.courseVersionName}`}
          />
        ) : section.courseId ? (
          <CourseContentDropdown section={section} />
        ) : section.isInstantSection ? (
          <Button
            variant="outlined"
            className={styles.instantSectionCodeButton}
            startIcon={<FontAwesomeV6Icon iconName="book-open-cover" />}
            aria-haspopup="dialog"
            onClick={() => setShowCourseRecommendations(true)}
          >
            {i18n.assignACourseButton()}
          </Button>
        ) : (
          <EmptyStateButton
            buttonText={i18n.assignACourseButton()}
            icon={'book-open-cover'}
            sectionId={section.id}
            path={'/catalog'}
          />
        )}
        {!section.isInstantSection &&
          section.unitId &&
          experiments.isEnabled('suggested-lesson') && (
            <SuggestedLessonLink sectionId={section.id} />
          )}
      </div>
      <div className={styles.sectionCardBodyRight}>
        {section.isInstantSection && (
          <Button
            variant="outlined"
            className={styles.instantSectionCodeButton}
            startIcon={<FontAwesomeV6Icon iconName="users" />}
            aria-haspopup="dialog"
            disabled={!section.code}
            onClick={() => setShowJoinCode(true)}
          >
            {i18n.instantSectionShowCode({numStudents: section.studentCount})}
          </Button>
        )}
        {section.studentCount > 0 &&
        section.courseId &&
        !section.isInstantSection ? (
          <TaskButton
            buttonText={i18n.viewProgressButton()}
            icon={'chart-line'}
            sectionId={section.id}
            sectionName={section.name}
            path={TEACHER_NAVIGATION_PATHS.progress}
          />
        ) : section.studentCount > 0 &&
          !section.courseId &&
          !section.isInstantSection ? (
          <div className={styles.studentsAddedAlert}>
            <div className={styles.taskButtonLeft}>
              <FontAwesomeV6Icon
                className={styles.studentAddedAlertIcon}
                iconName={'check-circle'}
                iconStyle={'solid'}
              />
              <Typography variant="body3" gutterBottom>
                {i18n.studentsAdded({numStudents: section.studentCount})}
              </Typography>
            </div>
          </div>
        ) : !section.isInstantSection ? (
          <EmptyStateButton
            buttonText={i18n.addStudents()}
            icon={'users'}
            sectionId={section.id}
            path={TEACHER_NAVIGATION_PATHS.roster}
          />
        ) : null}
        {section.courseId && !section.isInstantSection && (
          <TaskButton
            buttonText={i18n.viewLessonMaterialsButton()}
            icon={'folder-open'}
            sectionId={section.id}
            sectionName={section.name}
            path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
          />
        )}
      </div>
      {showJoinCode && section.code && (
        <InstantSectionCodeModal
          sectionCode={section.code}
          onClose={() => setShowJoinCode(false)}
        />
      )}
      {showCourseRecommendations && (
        <InstantSectionCourseAssignModal
          section={section}
          onClose={() => setShowCourseRecommendations(false)}
        />
      )}
    </div>
  );
};

export default SectionCardBody;
