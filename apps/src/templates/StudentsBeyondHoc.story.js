import React from 'react';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import Responsive from '../responsive';

export default storybook => {
  const responsive = new Responsive();
  return storybook
    .storiesOf('StudentsBeyondHoc', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Other tutorial, English, teacher',
        description: `StudentsBeyondHoc`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="other"
              responsive={responsive}
              isRtl={false}
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
              responsive={responsive}
              isRtl={false}
              userType="student"
              userAge={14}
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
              responsive={responsive}
              isRtl={false}
              userType="student"
              userAge={10}
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
              responsive={responsive}
              isRtl={false}
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
              responsive={responsive}
              isRtl={false}
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
              responsive={responsive}
              isRtl={false}
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
              responsive={responsive}
              isRtl={false}
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
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={true}
              userAge={8}
            />
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, English, 13+',
        description: `pre2017 Minecraft, signed in, English, 13+`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={true}
              userAge={16}
            />
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, non-English',
        description: `Same for signed out`,
        story: () => (
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={false}
            />
        )
      },
    ]);
};
