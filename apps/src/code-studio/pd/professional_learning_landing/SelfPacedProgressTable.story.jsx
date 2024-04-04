import React from 'react';
import SelfPacedProgressTable from './SelfPacedProgressTable';

export default {
  component: SelfPacedProgressTable,
};

const plCoursesStarted = [
  {
    name: '#',
    title: 'Course 1',
    current_lesson_name: 'Lesson 1',
    percent_completed: '10',
    finish_url: '#',
  },
  {
    name: '#',
    title: 'Course 2',
    current_lesson_name: 'Lesson 1',
    percent_completed: '45',
    finish_url: '#',
  },
  {
    name: '#',
    title: 'Course 2',
    current_lesson_name: 'Lesson 1',
    percent_completed: '100',
    finish_url: '#',
  },
];

export const Basic = () => {
  return <SelfPacedProgressTable plCoursesStarted={plCoursesStarted} />;
};
