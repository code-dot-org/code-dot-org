import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getFullName} from '../manageStudents/utils';

import Header from './header';
import StudentLessonProgressDetailsWidget from './studentLessonProgressDetailsWidget';
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

interface CFULevel {
  id: number;
  name: string;
  display_name: string;
  type: string;
  key?: string;
  script_level_id: number;
  progression?: string;
  progression_display_name?: string;
}

interface CFULevelsData {
  cfu_levels: CFULevel[];
}

const getCFULevels = (lessonId: number): Promise<CFULevel[]> => {
  return HttpClient.fetchJson<CFULevelsData>(
    `/student_snapshots/cfu_levels/${lessonId}`
  ).then(response => response?.value?.cfu_levels || []);
};

const StudentSnapshot: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    number | null
  >(null);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);
  const [cfuLevels, setCfuLevels] = useState<CFULevel[]>([]);
  const [isCfuLevelsLoading, setIsCfuLevelsLoading] = useState<boolean>(false);

  const sectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );
  const sectionCourseId = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .courseId
      : null
  );
  const selectedUnitId = useSelector(getSelectedUnitId);
  const selectedUnitPosition = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .unitPosition
      : null
  );
  const {selectedStudents} = useAppSelector(state => state.teacherSections);
  const selectedStudent = React.useMemo(
    () => selectedStudents.find(student => student.id === selectedStudentId),
    [selectedStudentId, selectedStudents]
  );

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
      loadUnitProgress(
        selectedUnitId,
        sectionId,
        sectionCourseId,
        selectedUnitPosition
      );
    }
  }, [sectionId, selectedUnitId, sectionCourseId, selectedUnitPosition]);

  // Fetch CFU levels when lesson changes
  React.useEffect(() => {
    if (selectedLessonId) {
      setIsCfuLevelsLoading(true);
      getCFULevels(selectedLessonId)
        .then(levels => {
          setCfuLevels(levels);
        })
        .catch(error => {
          console.error('Error fetching CFU levels:', error);
          setCfuLevels([]);
        })
        .finally(() => {
          setIsCfuLevelsLoading(false);
        });
    } else {
      setCfuLevels([]);
    }
  }, [selectedLessonId]);

  // TODO: Use this in CFU widget
  console.log(cfuLevels, isCfuLevelsLoading);

  // TODO: replace with actual values from URL/Redux later
  const HARDCODED_STUDENT_ID = 8; // Replace with actual student ID
  const HARDCODED_STUDENT_NAME = 'Student Name'; // Replace with actual student name

  return (
    <div className={styles.snapshotContainer}>
      <Header
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
        isLessonsLoading={isLessonsLoading}
        selectedStudent={selectedStudent}
        setSelectedStudentId={setSelectedStudentId}
        hasUnnumberedLessons={hasUnnumberedLessons}
      />

      {selectedStudent && (
        <Typography
          variant="h4"
          className={styles.studentNameHeader}
          gutterBottom
        >
          {selectedStudent ? getFullName(selectedStudent) : 'Unknown student'}
        </Typography>
      )}

      <div className={styles.widgetGrid}>
        <StudentRubricWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={HARDCODED_STUDENT_ID}
          studentName={HARDCODED_STUDENT_NAME}
          teacherHasEnabledAi={false}
          canProvideFeedback={true}
        />
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
        {selectedLessonId && selectedStudentId && (
          <StudentLessonProgressDetailsWidget
            selectedUnitId={selectedUnitId}
            selectedLessonId={selectedLessonId}
            selectedStudentId={selectedStudentId}
          />
        )}
      </div>
    </div>
  );
};

export default StudentSnapshot;
