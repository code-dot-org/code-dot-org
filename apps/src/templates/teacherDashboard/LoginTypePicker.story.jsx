import React from 'react';
import {UnconnectedLoginTypePicker as LoginTypePicker} from './LoginTypePicker';

export default storybook => storybook
  .storiesOf('LoginTypePicker', module)
  .add('Basic options', () => {
    return (
      <LoginTypePicker
        title="New section"
        handleImportOpen={storybook.action('handleImportOpen')}
        setLoginType={storybook.action('setLoginType')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  })
  .add('With Google Classroom import', () => {
    return (
      <LoginTypePicker
        title="New section"
        provider="google_classroom"
        handleImportOpen={storybook.action('handleImportOpen')}
        setLoginType={storybook.action('setLoginType')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  })
  .add('With Clever import', () => {
    return (
      <LoginTypePicker
        title="New section"
        provider="clever"
        handleImportOpen={storybook.action('handleImportOpen')}
        setLoginType={storybook.action('setLoginType')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  })
  .add('With Microsoft Classroom import', () => {
    return (
      <LoginTypePicker
        title="New section"
        provider="microsoft_classroom"
        handleImportOpen={storybook.action('handleImportOpen')}
        setLoginType={storybook.action('setLoginType')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  });
