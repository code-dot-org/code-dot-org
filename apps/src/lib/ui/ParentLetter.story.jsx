import React from 'react';
import PropTypes from 'prop-types';
import ParentLetter from './ParentLetter';

export default storybook =>
  storybook.storiesOf('ParentLetter', module).add('overview', () => (
    <Page>
      <ParentLetter loginType="email" teacherName="Minerva McGonagall" />
    </Page>
  ));

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
