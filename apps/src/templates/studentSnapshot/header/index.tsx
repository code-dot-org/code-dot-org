import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState} from 'react';

import {getFullName} from '@cdo/apps/templates/manageStudents/utils';
import LessonSelector, {
  LessonOption,
} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import UnitSelectorV2 from '@cdo/apps/templates/teacherDashboardShared/UnitSelectorV2';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {Student} from '../../progress/progressTypes';

import styles from './header.module.scss';

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
  const [selectedShowStudentsBy, setSelectedShowStudentsBy] =
    useState<string>('');

  const selectedLesson =
    lessons?.find(lesson => lesson.id === selectedLessonId) || null;

  // Find next and previous lessons based on position
  let currentLessonIndex = -1;
  let previousLesson = null;
  let nextLesson = null;
  if (lessons && Array.isArray(lessons) && selectedLesson) {
    currentLessonIndex = lessons.findIndex(
      lesson => lesson.id === selectedLesson.id
    );
    previousLesson =
      currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
    nextLesson =
      currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
        ? lessons[currentLessonIndex + 1]
        : null;
  }

  const showStudentsByOptions = [
    {value: 'lastName', text: 'Last Name'},
    {value: 'firstName', text: 'First Name'},
  ];

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

  const handlePreviousStudent = () => {
    alert('Previous student clicked!');
  };

  const handleNextStudent = () => {
    alert('Next student clicked!');
  };

  const {selectedStudents} = useAppSelector(state => state.teacherSections);

  React.useEffect(() => {
    if (selectedStudents.length > 0 && selectedStudent === undefined) {
      setSelectedStudentId(selectedStudents[0].id);
    }
  }, [selectedStudents, selectedStudent, setSelectedStudentId]);

  const studentOptions = React.useMemo(() => {
    return selectedStudents.map(student => ({
      value: student.id.toString(),
      text: getFullName(student),
    }));
  }, [selectedStudents]);

  return (
    <div className={styles.header}>
      <div className={styles.headerColumn}>
        <UnitSelectorV2
          filterToSelectedCourse={true}
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
          <Button
            className={styles.button}
            text="< Previous lesson"
            onClick={handlePreviousLesson}
            color="gray"
            type="secondary"
            disabled={!previousLesson || !lessons?.length || isLessonsLoading}
          />
          <Button
            className={styles.button}
            text="Next lesson >"
            onClick={handleNextLesson}
            color="gray"
            type="secondary"
            disabled={!nextLesson || !lessons?.length || isLessonsLoading}
          />
        </div>
      </div>

      <div className={styles.headerColumn}>
        <SimpleDropdown
          labelText="Show students by"
          name="showStudentsBy"
          items={showStudentsByOptions}
          selectedValue={selectedShowStudentsBy}
          onChange={event => setSelectedShowStudentsBy(event.target.value)}
          placeholder="Select an option"
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
        />
        <div className={styles.buttonGroup}>
          <Button
            className={styles.button}
            text="< Previous student"
            onClick={handlePreviousStudent}
            color="gray"
            type="secondary"
          />
          <Button
            className={styles.button}
            text="Next student >"
            onClick={handleNextStudent}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
