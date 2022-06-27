import React from 'react';
import Congrats from './Congrats';

const initialCertificateImageUrl = '/images/placeholder-hoc-image.jpg';
const defaultProps = {
  tutorial: 'other',
  userType: 'signedOut',
  language: 'en',
  initialCertificateImageUrl
};

export default storybook => {
  return storybook
    .storiesOf('Congrats/Congrats', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Congrats - Applab, signed out',
        description: `Congrats component if Applab tutorial completed`,
        story: () => <Congrats {...defaultProps} tutorial="applab-intro" />
      },
      {
        name: 'Congrats - Applab, student',
        description: `Congrats component if Applab tutorial completed, student`,
        story: () => (
          <Congrats
            {...defaultProps}
            tutorial="applab-intro"
            userType="student"
          />
        )
      },
      {
        name: 'Congrats - pre-2017 Minecraft, signed out',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => <Congrats {...defaultProps} tutorial="minecraft" />
      },
      {
        name: 'Congrats - pre-2017 Minecraft, student',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats {...defaultProps} tutorial="minecraft" userType="student" />
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, signed out',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => <Congrats {...defaultProps} tutorial="hero" />
      },
      {
        name: 'Congrats - 2017 Minecraft, student',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats {...defaultProps} tutorial="hero" userType="student" />
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, student, Korean',
        description: `Congrats component if 2017 Minecraft tutorial completed, in Korean`,
        story: () => (
          <Congrats
            {...defaultProps}
            tutorial="hero"
            userType="student"
            language="ko"
          />
        )
      },
      {
        name: 'Congrats - 2018 Minecraft, signed out',
        description: `Congrats component if 2018 Minecraft Aquatic tutorial completed`,
        story: () => <Congrats {...defaultProps} tutorial="aquatic" />
      },
      {
        name: 'Congrats - other, signed out',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => <Congrats {...defaultProps} />
      },
      {
        name: 'Congrats - other, student',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => <Congrats {...defaultProps} userType="student" />
      },
      {
        name: 'Congrats - other, teacher',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => <Congrats {...defaultProps} userType="teacher" />
      }
    ]);
};
