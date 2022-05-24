import React from 'react';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';

export default storybook => {
  return storybook
    .storiesOf('Congrats/GraduateToNextLevel', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Course 2',
        story: () => (
          <GraduateToNextLevel
            scriptName="course2"
            courseTitle="Course 2"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course 3',
        story: () => (
          <GraduateToNextLevel
            scriptName="course3"
            courseTitle="Course 3"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course 4',
        story: () => (
          <GraduateToNextLevel
            scriptName="course4"
            courseTitle="Course 4"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course B',
        story: () => (
          <GraduateToNextLevel
            scriptName="courseb"
            courseTitle="Course B"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course C',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursec"
            courseTitle="Course C"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course D',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursed"
            courseTitle="Course D"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course E',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursee"
            courseTitle="Course E"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'Course F',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursef"
            courseTitle="Course F"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      },
      {
        name: 'App Lab Intro',
        story: () => (
          <GraduateToNextLevel
            scriptName="applab-intro"
            courseTitle="App Lab Intro"
            courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
          />
        )
      }
    ]);
};
