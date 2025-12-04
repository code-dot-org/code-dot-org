import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState} from 'react';

import styles from './header.module.scss';

const Header: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedShowStudentsBy, setSelectedShowStudentsBy] =
    useState<string>('');

  const unitOptions = [
    {value: 'unit1', text: 'Unit 1'},
    {value: 'unit2', text: 'Unit 2'},
    {value: 'unit3', text: 'Unit 3'},
  ];

  const lessonOptions = [
    {value: 'lesson1', text: 'Lesson 1'},
    {value: 'lesson2', text: 'Lesson 2'},
    {value: 'lesson3', text: 'Lesson 3'},
  ];

  const studentOptions = [
    {value: 'student1', text: 'Student 1'},
    {value: 'student2', text: 'Student 2'},
    {value: 'student3', text: 'Student 3'},
    {value: 'student4', text: 'Student 4'},
  ];

  const showStudentsByOptions = [
    {value: 'lastName', text: 'Last Name'},
    {value: 'firstName', text: 'First Name'},
  ];

  const handlePreviousLesson = () => {
    alert('Previous lesson clicked!');
  };

  const handleNextLesson = () => {
    alert('Next lesson clicked!');
  };

  const handlePreviousStudent = () => {
    alert('Previous student clicked!');
  };

  const handleNextStudent = () => {
    alert('Next student clicked!');
  };
  return (
    <div className={styles.header}>
      <div className={styles.headerColumn}>
        <SimpleDropdown
          labelText="Unit"
          name="unit"
          items={unitOptions}
          selectedValue={selectedUnit}
          onChange={event => setSelectedUnit(event.target.value)}
          placeholder="Select a unit"
          className={styles.dropdown}
        />
        <SimpleDropdown
          labelText="Lesson"
          name="lesson"
          items={lessonOptions}
          selectedValue={selectedLesson}
          onChange={event => setSelectedLesson(event.target.value)}
          placeholder="Select a lesson"
          className={styles.dropdown}
        />
        <div className={styles.buttonGroup}>
          <Button
            className={styles.button}
            text="< Previous lesson"
            onClick={handlePreviousLesson}
            color="gray"
            type="secondary"
          />
          <Button
            className={styles.button}
            text="Next lesson >"
            onClick={handleNextLesson}
            color="gray"
            type="secondary"
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
          selectedValue={selectedStudent}
          onChange={event => setSelectedStudent(event.target.value)}
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
