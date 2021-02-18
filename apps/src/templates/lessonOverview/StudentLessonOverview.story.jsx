import React from 'react';
import StudentLessonOverview from './StudentLessonOverview';
const lessonData = {
  unit: {
    displayName: "CSP Unit 1 - Digital Information ('21-'22)",
    link: '/s csp1-2021',
    lessons: [
      {
        key: 'Welcome to CSP',
        displayName: 'Welcome to CSP',
        link: '/s/csp1-2021/lessons/1',
        position: 1
      },
      {
        key: 'Representing Information',
        displayName: 'Representing Information',
        link: '/s/csp1-2021/lessons/2',
        position: 2
      },
      {
        key: 'Circle Square Patterns',
        displayName: 'Circle Square Patterns',
        link: '/s/csp1-2021/lessons/3',
        position: 3
      }
    ]
  },
  position: 1,
  key: 'Welcome to CSP',
  displayName: 'Welcome to CSP',
  overview:
    'Welcome to Computer Science Principles! The first lesson is about getting students excited about the course and connecting their own personal interests to computer science.  Students are asked to share something they know a lot about and teach it to a small group.  Groups make a “rapid” prototype of an innovative idea and share it.  Students watch a brief video about computing innovations.  The lesson ends with students logging into the Code.org CSP course web site, and answering a brief prompt about what “computer science” means to them.',
  announcements: [
    {
      notice: 'Lesson Modifications',
      details:
        'Are you teaching in a Virtual setting or Socially-Distanced classroom? Check out our guidelines for modifications.',
      link:
        'https://docs.google.com/document/d/1WsCHV1oqTOhitJRDA2i6pghcydiJKY4LuYb-cZ-Zb6U/edit?usp=sharing',
      type: 'information',
      visibility: 'Teacher-only'
    }
  ],
  resources: {
    Student: [
      {
        key: 'personal-innovations-1',
        name: 'Personal Innovations',
        url:
          'https://docs.google.com/document/d/14UBbBCYtaWskax2UOcE-vMdSBUelte9qdKRhgQ6SeJU/',
        download_url: null,
        audience: 'Student',
        type: 'Activity Guide'
      },
      {
        key: 'rubric-personal-innovations-1',
        name: 'Personal Innovations',
        url:
          'https://docs.google.com/document/d/1_ULIYnSwsMxOEZr0SHP_ueopo4qlIHFCyrfFcMhuDgE/',
        download_url: null,
        audience: 'Student',
        type: 'Rubric'
      }
    ]
  },
  vocabularies: []
};

export default storybook =>
  storybook.storiesOf('StudentLessonOverview', module).addStoryTable([
    {
      name: 'basic',
      story: () => (
        <div>
          <StudentLessonOverview lesson={lessonData} />
        </div>
      )
    }
  ]);
