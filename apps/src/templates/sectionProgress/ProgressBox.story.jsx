import React from 'react';
import ProgressBox from './ProgressBox';

export default storybook => {
  return storybook.storiesOf('Progress/ProgressBox', module).addStoryTable([
    {
      name: 'Not started yet',
      description: `no levels have been started yet`,
      story: () => (
        <ProgressBox
          started={false}
          incomplete={20}
          imperfect={0}
          perfect={0}
        />
      )
    },
    {
      name: 'Incomplete',
      description: `no levels have been completed yet`,
      story: () => (
        <ProgressBox started={true} incomplete={20} imperfect={0} perfect={0} />
      )
    },
    {
      name: 'Imperfect and incomplete',
      description: `mostly too many blocks, some incomplete`,
      story: () => (
        <ProgressBox started={true} incomplete={5} imperfect={15} perfect={0} />
      )
    },
    {
      name: 'Mixed progress',
      description: `some perfect, some too many blocks, some incomplete`,
      story: () => (
        <ProgressBox started={true} incomplete={5} imperfect={5} perfect={10} />
      )
    },
    {
      name: 'Perfect or incomplete',
      description: `some perfect, some incomplete`,
      story: () => (
        <ProgressBox started={true} incomplete={7} imperfect={0} perfect={13} />
      )
    },
    {
      name: 'Perfect',
      description: `all levels completed perfectly`,
      story: () => (
        <ProgressBox started={true} incomplete={0} imperfect={0} perfect={20} />
      )
    },
    {
      name: 'Lesson number, complete',
      description: `include lesson number with green background`,
      story: () => (
        <ProgressBox
          started={true}
          incomplete={0}
          imperfect={0}
          perfect={20}
          lessonNumber={88}
        />
      )
    },
    {
      name: 'Lesson number, incomplete',
      description: `include lesson number with white background`,
      story: () => (
        <ProgressBox
          started={false}
          incomplete={0}
          imperfect={0}
          perfect={0}
          lessonNumber={1}
        />
      )
    }
  ]);
};
