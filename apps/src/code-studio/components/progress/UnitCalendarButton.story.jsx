import React from 'react';
import UnitCalendarButton from './UnitCalendarButton';

export default storybook =>
  storybook.storiesOf('UnitCalendarButton', module).addStoryTable([
    {
      name: 'basic',
      story: () => (
        <div>
          <UnitCalendarButton
            lessons={[
              {
                id: 1,
                title: 'Lesson 1',
                duration: 87,
                assessment: true,
                unplugged: false,
                isStart: true,
                isEnd: true,
                isMajority: true,
                url: 'https://www.google.com/'
              },
              {
                id: 2,
                title: 'Lesson 2',
                duration: 40,
                assessment: false,
                unplugged: true,
                isStart: true,
                isEnd: true,
                isMajority: true,
                url: 'https://www.google.com/'
              },
              {
                id: 3,
                title: 'Lesson 3',
                duration: 135,
                assessment: true,
                unplugged: true,
                isStart: false,
                isEnd: true,
                isMajority: true,
                url: 'https://www.google.com/'
              },
              {
                id: 4,
                title: 'Lesson 4',
                duration: 60,
                assessment: false,
                unplugged: false,
                isStart: true,
                isEnd: true,
                isMajority: true,
                url: 'https://www.google.com/'
              }
            ]}
            weeklyInstructionalMinutes={90}
          />
        </div>
      )
    }
  ]);
