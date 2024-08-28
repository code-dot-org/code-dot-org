import React from 'react';

import {Heading1, Heading2, Heading3} from './Headings';

export default {
  // The component and subcomponents properties are somewhat invalid since all headings hold the
  // same weight here, but Storybook requires us to set the component property.
  component: Heading1,
  subcomponents: {Heading2, Heading3},
};

//
// STORIES
//

export const Heading_1 = args => <Heading1>The quick brown fox</Heading1>;

export const Heading_2 = args => <Heading2>The quick brown fox</Heading2>;

export const Heading_3 = args => <Heading3>The quick brown fox</Heading3>;

export const Stacked = args => (
  <div>
    <Heading1>The quick brown fox</Heading1>
    <Heading2>The quick brown fox</Heading2>
    <Heading3>The quick brown fox</Heading3>
  </div>
);

export const WithPassThroughProps = args => (
  <Heading1 style={{color: 'red'}}>The quick brown fox</Heading1>
);
