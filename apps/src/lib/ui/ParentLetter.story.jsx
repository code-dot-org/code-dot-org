import React from 'react';
import PropTypes from 'prop-types';
import ParentLetter from './ParentLetter';
import {SectionLoginType} from '../../util/sharedConstants';
import wizardPng from '../../../static/skins/studio/wizard_thumb.png';

export default storybook => {
  storybook = storybook.storiesOf('ParentLetter', module);

  // Make stories for generic letters and personalized letters
  // Make a story for every login type
  Object.values(SectionLoginType).forEach(loginType => {
    storybook = storybook.add(`Generic / ${loginType}`, () => (
      <Page>
        <ParentLetter
          loginType={loginType}
          sectionCode="ABCDEF"
          teacherName="Minerva McGonagall"
        />
      </Page>
    ));

    storybook = storybook.add(`Personalized / ${loginType}`, () => (
      <Page>
        <ParentLetter
          loginType={loginType}
          secretPicturePath={wizardPng}
          secretWords="wizarding world"
          sectionCode="ABCDEF"
          teacherName="Minerva McGonagall"
          studentName="Neville"
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
