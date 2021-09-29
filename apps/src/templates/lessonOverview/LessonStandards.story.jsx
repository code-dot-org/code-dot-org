import React from 'react';
import LessonStandards, {ExpandMode} from './LessonStandards';
import {
  cspStandards,
  cstaStandards
} from '../../../test/unit/templates/lessonOverview/sampleStandardsData.js';

export default storybook => {
  storybook.storiesOf('LessonStandards', module).addStoryTable([
    {
      name: 'standard with parent category',
      story: () => <LessonStandards standards={[cspStandards[0]]} />
    },
    {
      name: 'standard without parent category',
      story: () => <LessonStandards standards={[cstaStandards[0]]} />
    },
    {
      name: 'many standards from different frameworks',
      story: () => (
        <LessonStandards standards={cspStandards.concat(cstaStandards)} />
      )
    },
    {
      name: 'expand all of many standards',
      story: () => (
        <LessonStandards
          standards={cspStandards.concat(cstaStandards)}
          expandMode={ExpandMode.ALL}
        />
      )
    }
  ]);
};
