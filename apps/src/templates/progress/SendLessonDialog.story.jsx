import React from 'react';
import SendLessonDialog from './SendLessonDialog';
import ExampleDialogButton from '@cdo/apps/util/ExampleDialogButton';

export default storybook => {
  return storybook.storiesOf('SendLessonDialog', module).addStoryTable([
    {
      name: 'with copy to clipboard button',
      story: () => {
        return (
          <ExampleDialogButton>
            <SendLessonDialog lessonUrl="https://studio.code.org/s/coursee-2020/stage/2/puzzle/1" />
          </ExampleDialogButton>
        );
      }
    },
    {
      name: 'with copy to clipboard and google buttons',
      story: () => {
        return (
          <ExampleDialogButton>
            <SendLessonDialog
              lessonUrl="https://studio.code.org/s/coursee-2020/stage/2/puzzle/1"
              showGoogleButton
            />
          </ExampleDialogButton>
        );
      }
    }
  ]);
};
