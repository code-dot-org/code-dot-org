import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useMemo} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getFullName} from '@cdo/apps/templates/manageStudents/utils';
import SortByNameDropdown from '@cdo/apps/templates/SortByNameDropdown';
import {Student} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import LessonSelector, {
  LessonOption,
} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import UnitSelectorV2 from '@cdo/apps/templates/teacherDashboardShared/UnitSelectorV2';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import stringKeyComparator from '@cdo/apps/util/stringKeyComparator';

import styles from './header.module.scss';

/**
 * Helper function to find the previous and next items in an array based
 * on the selected item.
 * @param items - Array of items to search through
 * @param selectedItem - The currently selected item
 * @param getId - Function to extract the ID from an item for comparison
 * @returns Object containing currentIndex, previous, and next items
 */
function findNavigationItems<T>(
  items: T[] | null | undefined,
  selectedItem: T | null | undefined,
  getId: (item: T) => number | string
): {
  currentIndex: number;
  previous: T | null;
  next: T | null;
} {
  let currentIndex = -1;
  let previous: T | null = null;
  let next: T | null = null;

  if (items && Array.isArray(items) && selectedItem) {
    currentIndex = items.findIndex(item => getId(item) === getId(selectedItem));
    previous = currentIndex > 0 ? items[currentIndex - 1] : null;
    next =
      currentIndex >= 0 && currentIndex < items.length - 1
        ? items[currentIndex + 1]
        : null;
  }

  return {currentIndex, previous, next};
}

interface HeaderProps {
  lessons: LessonOption[];
  selectedLessonId: number | null;
  setSelectedLessonId: (lessonId: number | null) => void;
  isLessonsLoading: boolean;
  selectedStudent: Student | undefined;
  setSelectedStudentId: (id: number) => void;
  hasUnnumberedLessons?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  lessons,
  selectedLessonId,
  setSelectedLessonId,
  isLessonsLoading,
  selectedStudent,
  setSelectedStudentId,
  hasUnnumberedLessons = false,
}) => {
  const selectedLesson =
    lessons?.find(lesson => lesson.id === selectedLessonId) || null;

  // Find next and previous lessons based on position
  const {previous: previousLesson, next: nextLesson} = findNavigationItems(
    lessons,
    selectedLesson,
    lesson => lesson.id
  );

  const handlePreviousLesson = () => {
    if (previousLesson) {
      setSelectedLessonId(previousLesson.id);
      analyticsReporter.sendEvent(
        EVENTS.STUDENT_SNAPSHOT_PREVIOUS_LESSON_CLICKED,
        {lessonId: previousLesson.id}
      );
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
      analyticsReporter.sendEvent(EVENTS.STUDENT_SNAPSHOT_NEXT_LESSON_CLICKED, {
        lessonId: nextLesson.id,
      });
    }
  };

  const {selectedStudents, selectedSectionId, selectedSectionUnitName} =
    useAppSelector(state => state.teacherSections);
  const isSortedByFamilyName = useAppSelector(
    state => state.currentUser.isSortedByFamilyName
  );

  const sortedStudents = useMemo(() => {
    return isSortedByFamilyName
      ? [...selectedStudents].sort(stringKeyComparator(['familyName', 'name']))
      : [...selectedStudents].sort(stringKeyComparator(['name', 'familyName']));
  }, [selectedStudents, isSortedByFamilyName]);

  React.useEffect(() => {
    if (sortedStudents.length > 0 && selectedStudent === undefined) {
      setSelectedStudentId(sortedStudents[0].id);
    }
  }, [sortedStudents, selectedStudent, setSelectedStudentId]);

  const studentOptions = useMemo(() => {
    return sortedStudents.map(student => ({
      value: student.id.toString(),
      text: getFullName(student) + (student.isDemoStudent ? ' (Demo)' : ''),
    }));
  }, [sortedStudents]);

  // Find next and previous students based on position
  const {previous: previousStudent, next: nextStudent} = useMemo(
    () => findNavigationItems(sortedStudents, selectedStudent, s => s.id),
    [sortedStudents, selectedStudent]
  );

  const handlePreviousStudent = useCallback(() => {
    if (previousStudent) {
      setSelectedStudentId(previousStudent.id);
      analyticsReporter.sendEvent(
        EVENTS.STUDENT_SNAPSHOT_PREVIOUS_STUDENT_CLICKED,
        {studentId: previousStudent.id}
      );
    }
  }, [previousStudent, setSelectedStudentId]);

  const handleNextStudent = useCallback(() => {
    if (nextStudent) {
      setSelectedStudentId(nextStudent.id);
      analyticsReporter.sendEvent(
        EVENTS.STUDENT_SNAPSHOT_NEXT_STUDENT_CLICKED,
        {studentId: nextStudent.id}
      );
    }
  }, [nextStudent, setSelectedStudentId]);

  return (
    <div className={styles.header}>
      <div className={styles.headerColumn}>
        <div>
          <span className={styles.groupLabel}>Unit</span>
          <UnitSelectorV2
            filterToSelectedCourse={false}
            className={styles.unitSelector}
            labelText="Unit"
            onUserUnitChange={(unitId: number) => {
              analyticsReporter.sendEvent(
                EVENTS.STUDENT_SNAPSHOT_UNIT_SELECTED,
                {unitId}
              );
            }}
          />
        </div>
        <div>
          <span className={styles.groupLabel}>Lesson</span>
          <div className={styles.prevNextDropdown}>
            <LessonSelector
              lessons={lessons || []}
              selectedLesson={selectedLesson}
              onLessonChange={(lessonId: number) => {
                setSelectedLessonId(lessonId);
              }}
              onUserLessonChange={(lessonId: number) => {
                analyticsReporter.sendEvent(
                  EVENTS.STUDENT_SNAPSHOT_LESSON_SELECTED,
                  {lessonId}
                );
              }}
              hasUnnumberedLessons={hasUnnumberedLessons}
              isLoading={isLessonsLoading}
              className={styles.dropdown}
              isLabelVisible={false}
              labelText="Lesson"
              dropdownTextThickness="thin"
            />
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              disabled={!previousLesson || !lessons?.length || isLessonsLoading}
              onClick={handlePreviousLesson}
              type="button"
              startIcon={<FontAwesomeV6Icon iconName="chevron-left" />}
            >
              Prev
            </MuiButton>
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              disabled={!nextLesson || !lessons?.length || isLessonsLoading}
              onClick={handleNextLesson}
              type="button"
              endIcon={<FontAwesomeV6Icon iconName="chevron-right" />}
            >
              Next
            </MuiButton>
          </div>
        </div>
      </div>

      <div className={styles.headerColumn}>
        <div>
          <span className={styles.groupLabel}>Sort by</span>
          <SortByNameDropdown
            sectionId={selectedSectionId ?? undefined}
            unitName={selectedSectionUnitName || undefined}
            source="STUDENT_SNAPSHOT"
            className={styles.dropdown}
            isLabelVisible={false}
          />
        </div>

        <div>
          <span className={styles.groupLabel}>Student</span>
          <div className={styles.prevNextDropdown}>
            <SimpleDropdown
              labelText="Student"
              name="student"
              items={studentOptions}
              selectedValue={selectedStudent?.id.toString() || ''}
              onChange={event => {
                const studentId = Number(event.target.value);
                setSelectedStudentId(studentId);
                analyticsReporter.sendEvent(
                  EVENTS.STUDENT_SNAPSHOT_STUDENT_SELECTED,
                  {studentId}
                );
              }}
              className={styles.dropdown}
              size="s"
              color="gray"
              isLabelVisible={false}
              dropdownTextThickness="thin"
            />
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              disabled={!previousStudent || !selectedStudents?.length}
              onClick={handlePreviousStudent}
              type="button"
              startIcon={<FontAwesomeV6Icon iconName="chevron-left" />}
            >
              Prev
            </MuiButton>
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              disabled={!nextStudent || !selectedStudents?.length}
              onClick={handleNextStudent}
              type="button"
              endIcon={<FontAwesomeV6Icon iconName="chevron-right" />}
            >
              Next
            </MuiButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
