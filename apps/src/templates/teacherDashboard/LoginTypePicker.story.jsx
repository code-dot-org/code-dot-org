import React from 'react';
import {UnconnectedLoginTypePicker as LoginTypePicker} from './LoginTypePicker';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('LoginTypePicker', module)
  .add('Basic options', () => {
    return (
      <LoginTypePicker
        title="New section"
        handleImportOpen={action('handleImportOpen')}
        setLoginType={action('setLoginType')}
        handleCancel={action('handleCancel')}
      />
    );
  })
  .add('With Google Classroom import', () => {
    return (
      <LoginTypePicker
        title="New section"
        provider="google_classroom"
        handleImportOpen={action('handleImportOpen')}
        setLoginType={action('setLoginType')}
        handleCancel={action('handleCancel')}
      />
    );
  })
  .add('With Clever import', () => {
    return (
      <LoginTypePicker
        title="New section"
        provider="clever"
        handleImportOpen={action('handleImportOpen')}
        setLoginType={action('setLoginType')}
        handleCancel={action('handleCancel')}
      />
    );
  })
  .add('With Microsoft Classroom import', () => {
    return (
      <LoginTypePicker
        title="New section"
        provider="microsoft_classroom"
        handleImportOpen={action('handleImportOpen')}
        setLoginType={action('setLoginType')}
        handleCancel={action('handleCancel')}
      />
    );
  });
