import React from 'react';
import StudentsBeyondHoc from './StudentsBeyondHoc';

export default storybook => {
  return storybook
    .storiesOf('Congrats/StudentsBeyondHoc', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Other tutorial, English, teacher',
        description: `StudentsBeyondHoc`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="other"
              userType="teacher"
              isEnglish={true}
            />
        )
      },
      {
        name: 'Other tutorial, English, student over 13',
        description: `StudentsBeyondHoc`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="other"
              userType="student"
              under13={false}
              isEnglish={true}
            />
        )
      },
      {
        name: 'Other tutorial, English, student under 13',
        description: `StudentsBeyondHoc`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="other"
              userType="student"
              under13={true}
              isEnglish={true}
            />
        )
      },
      {
        name: 'Other tutorial, English, signed out',
        description: `StudentsBeyondHoc`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="other"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: 'Other tutorial, non-English, signed out',
        description: `StudentsBeyondHoc`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="other"
              userType="signedOut"
              isEnglish={false}
            />
        )
      },
      {
        name: 'Applab, signed out, English',
        description: `Same for non-English`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="applab"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: 'Applab, signed in, English',
        description: `Same for non-English`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="applab"
              userType="student"
              isEnglish={true}
            />
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, English, under 13',
        description: `pre2017 Minecraft, signed in, English, under 13`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              userType="student"
              isEnglish={true}
              under13={true}
            />
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, English, 13+',
        description: `pre2017 Minecraft, signed in, English, 13+`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              userType="student"
              isEnglish={true}
              under13={false}
            />
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, non-English',
        description: `Same for signed out`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              userType="student"
              isEnglish={false}
            />
        )
      },
      {
        name: '2018 Minecraft, English, young student',
        description: `2018 Aquatic Minecraft, signed in, English, under 13`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="2018Minecraft"
              userType="student"
              isEnglish={true}
              under13={true}
            />
        )
      },
      {
        name: '2018 Minecraft, English, older student',
        description: `2018 Aquatic Minecraft, signed in, English, 13+, same for teachers`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="2018Minecraft"
              userType="student"
              isEnglish={true}
              under13={false}
            />
        )
      },
      {
        name: '2018 Minecraft, non-English',
        description: `Same for signed out, young student, older student and teachers`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="2018Minecraft"
              userType="student"
              isEnglish={false}
            />
        )
      },
      {
        name: 'Dance, signed in, English',
        description: `Same for young student, older student and teacher`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="dance"
              userType="student"
              isEnglish={true}
            />
        )
      },
      {
        name: 'Dance, signed in, non-English',
        description: `Same for young student, older student and teacher`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="dance"
              userType="student"
              isEnglish={false}
            />
        )
      },
      {
        name: 'Dance, signed out, English',
        description: `Same for young student, older student and teacher`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="dance"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: 'Dance, signed out, non-English',
        description: `Same for young student, older student and teacher`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="dance"
              userType="signedOut"
              isEnglish={false}
            />
        )
      },
    ]);
};
