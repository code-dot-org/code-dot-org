import React from 'react';
import {UnconnectedLessonStatusDialog as LessonStatusDialog} from './LessonStatusDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
    .storiesOf('Standards/LessonStatusDialog', module)
    .add('overview', () => {
      return <LessonStatusDialog isOpen handleConfirm={action('Confirm')} />;
    });
};
