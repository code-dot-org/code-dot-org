import React from 'react';
import Congrats from './Congrats';

const initialCertificateImageUrl = '/images/placeholder-hoc-image.jpg';

export default storybook => {
  return storybook
    .storiesOf('Congrats/Congrats', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Congrats - Applab, signed out',
        description: `Congrats component if Applab tutorial completed`,
        story: () => (
          <Congrats
            tutorial="applab-intro"
            userType="signedOut"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - Applab, student',
        description: `Congrats component if Applab tutorial completed, student`,
        story: () => (
          <Congrats
            tutorial="applab-intro"
            userType="student"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - pre-2017 Minecraft, signed out',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats
            tutorial="minecraft"
            userType="signedOut"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - pre-2017 Minecraft, student',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats
            tutorial="minecraft"
            userType="student"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, signed out',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats
            tutorial="hero"
            userType="signedOut"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, student',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats
            tutorial="hero"
            userType="student"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, student, Korean',
        description: `Congrats component if 2017 Minecraft tutorial completed, in Korean`,
        story: () => (
          <Congrats
            tutorial="hero"
            userType="student"
            language="ko"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - 2018 Minecraft, signed out',
        description: `Congrats component if 2018 Minecraft Aquatic tutorial completed`,
        story: () => (
          <Congrats
            tutorial="aquatic"
            userType="signedOut"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - other, signed out',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Congrats
            tutorial="other"
            userType="signedOut"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - other, student',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Congrats
            tutorial="other"
            userType="student"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      },
      {
        name: 'Congrats - other, teacher',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Congrats
            tutorial="other"
            userType="teacher"
            language="en"
            initialCertificateImageUrl={initialCertificateImageUrl}
          />
        )
      }
    ]);
};
