import React from 'react';
import {Heading1, Heading2, Heading3} from './Headings';

export default storybook => storybook
  .storiesOf('Headings', module)
  .addStoryTable([
    {
      name: 'Heading1',
      description: '',
      story: () => <Heading1>The quick brown fox</Heading1>,
    },
    {
      name: 'Heading2',
      description: '',
      story: () => <Heading2>The quick brown fox</Heading2>,
    },
    {
      name: 'Heading3',
      description: '',
      story: () => <Heading3>The quick brown fox</Heading3>,
    },
    {
      name: 'Stacked',
      description: '',
      story: () => (
        <div>
          <Heading1>The quick brown fox</Heading1>
          <Heading2>The quick brown fox</Heading2>
          <Heading3>The quick brown fox</Heading3>
        </div>
      ),
    },
    {
      name: 'With pass-through props',
      description: '',
      story: () => (
        <div>
          <Heading1
            style={{color: 'red'}}
          >
            The quick brown fox
          </Heading1>
        </div>
      ),
    },
  ]);
