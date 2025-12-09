import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';

import Header from './header';
import StudentRubricWidget from './studentRubricWidget/StudentRubricWidget';
import WidgetTemplate from './widgetTemplate';

import styles from './studentSnapshot.module.scss';

interface LessonsData {
  lessons: LessonOption[];
  hasUnnumberedLessons: boolean;
}

const getLessons = (unitId: number) =>
  HttpClient.fetchJson<LessonsData>(
    `/student_snapshots/lessons/${unitId}`
  ).then(response => response?.value);

const lessonsCachedLoader = _.memoize(getLessons);

const StudentSnapshot: React.FC = () => {
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);

  const selectedUnitId = useSelector(getSelectedUnitId);
  React.useEffect(() => {
    if (selectedUnitId) {
      setIsLessonsLoading(true);
      lessonsCachedLoader(selectedUnitId)
        .then(lessonsData => {
          setLessons(lessonsData.lessons);
          setHasUnnumberedLessons(lessonsData.hasUnnumberedLessons);
        })
        .finally(() => {
          setIsLessonsLoading(false);
        });
    }
  }, [selectedUnitId]);

  // TODO: replace with actual values from URL/Redux later
  const HARDCODED_STUDENT_ID = 8; // Replace with actual student ID

  return (
    <div className={styles.snapshotContainer}>
      <Header
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
        isLessonsLoading={isLessonsLoading}
        hasUnnumberedLessons={hasUnnumberedLessons}
      />

      <Typography
        variant="h4"
        className={styles.studentNameHeader}
        gutterBottom
      >
        <Typography variant="strong">{'<Student name>'}</Typography>
      </Typography>

      <div className={styles.widgetGrid}>
        {selectedLessonId && (
          <StudentRubricWidget
            gridWidth={2}
            gridHeight={2}
            lessonId={selectedLessonId}
            studentId={HARDCODED_STUDENT_ID}
            teacherHasEnabledAi={false}
            canProvideFeedback={true}
          />
        )}
        <WidgetTemplate widgetName="Long Widget" gridWidth={3} gridHeight={1}>
          <div>content</div>
        </WidgetTemplate>
        <WidgetTemplate widgetName="Big Widget" gridWidth={2} gridHeight={2}>
          <div>big content</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 1"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 1</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 2"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 2</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 3"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 3</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Loading widget"
          gridWidth={1}
          gridHeight={1}
          loading={true}
        >
          <div>Should not be displayed</div>
        </WidgetTemplate>
      </div>
    </div>
  );
};

export default StudentSnapshot;
