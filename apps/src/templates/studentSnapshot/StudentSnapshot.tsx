import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import type {
  Rubric,
  RubricData,
  StudentLevelInfo,
} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';

import Header from './header';
import StudentRubricWidget from './StudentRubricWidget';
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

  // Hardcoded values for testing - replace with actual values from URL/Redux later
  const HARDCODED_RUBRIC_ID = 1; // Replace with actual rubric ID
  const HARDCODED_STUDENT_ID = 1; // Replace with actual student ID

  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [studentLevelInfo, setStudentLevelInfo] =
    useState<StudentLevelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch rubric
        const rubricResponse = await HttpClient.fetchJson<RubricData>(
          `/rubrics/${HARDCODED_RUBRIC_ID}`
        );

        if (rubricResponse.value?.rubric) {
          setRubric(rubricResponse.value.rubric);
        } else {
          setError('No rubric data found');
          return;
        }

        // For now, use placeholder student level info
        // TODO: Fetch actual student level info from backend
        setStudentLevelInfo({
          name: 'Student Name',
          user_id: HARDCODED_STUDENT_ID,
          timeSpent: 0,
          attempts: 0,
          lastAttempt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to fetch rubric data:', err);
        setError('Failed to load rubric data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {isLoading && (
          <WidgetTemplate
            widgetName="Rubric"
            gridWidth={3}
            gridHeight={2}
            loading={true}
          >
            <div>Loading rubric...</div>
          </WidgetTemplate>
        )}
        {error && (
          <WidgetTemplate widgetName="Rubric" gridWidth={2} gridHeight={2}>
            <div style={{padding: '16px', color: '#d32f2f'}}>{error}</div>
          </WidgetTemplate>
        )}
        {rubric && studentLevelInfo && !isLoading && (
          <StudentRubricWidget
            gridWidth={3}
            gridHeight={2}
            rubric={rubric}
            studentLevelInfo={studentLevelInfo}
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
