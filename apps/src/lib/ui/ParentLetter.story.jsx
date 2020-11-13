import React from 'react';
import PropTypes from 'prop-types';
import {UnconnectedParentLetter as ParentLetter} from './ParentLetter';
import {SectionLoginType} from '../../util/sharedConstants';
import wizardPng from '../../../static/skins/studio/wizard_thumb.png';

export default storybook => {
  storybook = storybook.storiesOf('ParentLetter', module);

  const sampleSection = {
    id: 7,
    code: 'ABCDEF'
  };

  const sampleStudents = [
    {
      id: 100,
      name: 'Neville',
      secret_picture_path: wizardPng,
      secret_words: 'wizarding world'
    },
    {
      id: 101,
      name: 'Hermione',
      secret_picture_path: wizardPng,
      secret_words: 'wizarding world'
    }
  ];

  // Make stories for generic letters and personalized letters
  // Make a story for every login type
  Object.values(SectionLoginType).forEach(loginType => {
    storybook = storybook.add(`Generic / ${loginType}`, () => (
      <Page>
        <ParentLetter
          section={{
            ...sampleSection,
            loginType: loginType
          }}
          teacherName="Minerva McGonagall"
        />
      </Page>
    ));

    storybook = storybook.add(`Personalized / ${loginType}`, () => (
      <Page>
        <ParentLetter
          section={{
            ...sampleSection,
            loginType: loginType
          }}
          teacherName="Minerva McGonagall"
          students={sampleStudents}
          studentId={'101'}
        />
      </Page>
    ));
  });
};

const Page = ({children}) => (
  <div
    style={{
      backgroundColor: 'white',
      width: '8.5in',
      height: '11in',
      padding: '1in',
      margin: '0.25in',
      border: 'solid gray thin'
    }}
  >
    {children}
  </div>
);
Page.propTypes = {children: PropTypes.node};
