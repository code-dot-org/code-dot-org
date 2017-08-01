import React from 'react';
import experiments from '../../util/experiments';
import {UnconnectedLoginTypePicker as LoginTypePicker} from './LoginTypePicker';

export default storybook => storybook
  .storiesOf('LoginTypePicker', module)
  .add('Basic options', () => {
    experiments.setEnabled('importClassroom', false);
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
    experiments.setEnabled('importClassroom', true);
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
    experiments.setEnabled('importClassroom', true);
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
    experiments.setEnabled('importClassroom', true);
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
