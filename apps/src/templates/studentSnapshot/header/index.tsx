import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useMemo} from 'react';

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
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
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
      text: getFullName(student),
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
    }
  }, [previousStudent, setSelectedStudentId]);

  const handleNextStudent = useCallback(() => {
    if (nextStudent) {
      setSelectedStudentId(nextStudent.id);
    }
  }, [nextStudent, setSelectedStudentId]);

  return (
    <div className={styles.header}>
      <div className={styles.headerColumn}>
        <UnitSelectorV2
          filterToSelectedCourse={false}
          className={styles.unitSelector}
          isLabelVisible={true}
          labelText="Unit"
        />
        <LessonSelector
          lessons={lessons || []}
          selectedLesson={selectedLesson}
          onLessonChange={(lessonId: number) => {
            setSelectedLessonId(lessonId);
          }}
          hasUnnumberedLessons={hasUnnumberedLessons}
          isLoading={isLessonsLoading}
          className={styles.dropdown}
          isLabelVisible={true}
          labelText="Lesson"
        />
        <div className={styles.buttonGroup}>
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="medium"
            disabled={!previousLesson || !lessons?.length || isLessonsLoading}
            className={styles.button}
            onClick={handlePreviousLesson}
            type="button"
          >
            {'< Previous lesson'}
          </MuiButton>
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="medium"
            disabled={!nextLesson || !lessons?.length || isLessonsLoading}
            className={styles.button}
            onClick={handleNextLesson}
            type="button"
          >
            {'Next lesson >'}
          </MuiButton>
        </div>
      </div>

      <div className={styles.headerColumn}>
        <SortByNameDropdown
          sectionId={selectedSectionId ?? undefined}
          unitName={selectedSectionUnitName || undefined}
          source="STUDENT_SNAPSHOT"
          className={styles.dropdown}
        />
        <SimpleDropdown
          labelText="Student"
          name="student"
          items={studentOptions}
          selectedValue={selectedStudent?.id.toString() || ''}
          onChange={event => setSelectedStudentId(Number(event.target.value))}
          placeholder="Select a student"
          className={styles.dropdown}
          size="s"
          color="gray"
        />
        <div className={styles.buttonGroup}>
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="medium"
            disabled={!previousStudent || !selectedStudents?.length}
            className={styles.button}
            onClick={handlePreviousStudent}
            type="button"
          >
            {'< Previous student'}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            disabled={!nextStudent || !selectedStudents?.length}
            className={styles.button}
            onClick={handleNextStudent}
            type="button"
          >
            {'Next student >'}
          </MuiButton>
        </div>
      </div>
    </div>
  );
};

export default Header;
