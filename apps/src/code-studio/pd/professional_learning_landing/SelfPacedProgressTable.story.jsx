import React from 'react';
import SelfPacedProgressTable from './SelfPacedProgressTable';

export default {
  component: SelfPacedProgressTable,
};

const plCoursesStarted = [
  {
    name: '#',
    title: 'Course is in progress',
    current_lesson_name: 'Current lesson name',
    percent_completed: 10,
    finish_url: '',
  },
  {
    name: '#',
    title: 'Course is in progress and has unit certificates',
    current_lesson_name: 'Current lesson name',
    percent_completed: 45,
    finish_url: '#',
  },
  {
    name: '#',
    title: 'Course is complete',
    current_lesson_name: 'Current lesson name',
    percent_completed: 100,
    finish_url: '#',
  },
];

export const Basic = () => {
  return <SelfPacedProgressTable plCoursesStarted={plCoursesStarted} />;
};
