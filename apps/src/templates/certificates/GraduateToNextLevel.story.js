import React from 'react';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';
import i18n from '@cdo/locale';

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
            courseTitle={i18n.course2_name()}
            courseDesc={i18n.course2_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course 3',
        story: () => (
          <GraduateToNextLevel
            scriptName="course3"
            courseTitle={i18n.course3_name()}
            courseDesc={i18n.course3_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course 4',
        story: () => (
          <GraduateToNextLevel
            scriptName="course4"
            courseTitle={i18n.course4_name()}
            courseDesc={i18n.course4_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course B',
        story: () => (
          <GraduateToNextLevel
            scriptName="courseb"
            courseTitle={i18n.courseb_name()}
            courseDesc={i18n.courseb_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course C',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursec"
            courseTitle={i18n.coursec_name()}
            courseDesc={i18n.coursec_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course D',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursed"
            courseTitle={i18n.coursed_name()}
            courseDesc={i18n.coursed_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course E',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursee"
            courseTitle={i18n.coursee_name()}
            courseDesc={i18n.coursee_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'Course F',
        story: () => (
          <GraduateToNextLevel
            scriptName="coursef"
            courseTitle={i18n.coursef_name()}
            courseDesc={i18n.coursef_shortdescription_congrats()}
          />
        )
      },
      {
        name: 'App Lab Intro',
        story: () => (
          <GraduateToNextLevel
            scriptName="applab-intro"
            courseTitle={i18n.applab_tile_title()}
            courseDesc={i18n.applab_tile_subtitle()}
          />
        )
      }
    ]);
};
