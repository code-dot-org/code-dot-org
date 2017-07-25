import React from 'react';
import experiments from '../../util/experiments';
import LoginTypePicker from './LoginTypePicker';

export default storybook => storybook
  .storiesOf('LoginTypePicker', module)
  .add('Basic options', () => {
    experiments.setEnabled('googleClassroom', false);
    experiments.setEnabled('microsoftClassroom', false);
    experiments.setEnabled('clever', false);
    return (
      <LoginTypePicker
        title="New section"
        handleLoginChoice={storybook.action('handleLoginChoice')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  })
  .add('All options', () => {
    experiments.setEnabled('googleClassroom', true);
    experiments.setEnabled('microsoftClassroom', true);
    experiments.setEnabled('clever', true);
    return (
      <LoginTypePicker
        title="New section"
        handleLoginChoice={storybook.action('handleLoginChoice')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  });
