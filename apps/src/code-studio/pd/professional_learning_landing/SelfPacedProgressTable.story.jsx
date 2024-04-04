import React from 'react';
import SelfPacedProgressTable from './SelfPacedProgressTable';

export default {
  component: SelfPacedProgressTable,
};

const plCoursesStarted = [
  {
    name: '#',
    title: 'Course 1',
    current_lesson_name: 'Course is still in progress',
    percent_completed: 45,
    finish_url: '',
  },
  {
    name: '#',
    title: 'Course 2',
    current_lesson_name: 'Course is in progress and has certificates available',
    percent_completed: 10,
    finish_url: '#',
  },
  {
    name: '#',
    title: 'Course 3',
    current_lesson_name: 'Course is completed!',
    percent_completed: 100,
    finish_url: '#',
  },
];

export const Basic = () => {
  return <SelfPacedProgressTable plCoursesStarted={plCoursesStarted} />;
};
