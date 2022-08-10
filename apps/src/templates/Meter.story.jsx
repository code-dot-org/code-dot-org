import React from 'react';

import Meter from '@cdo/apps/templates/Meter';
import color from '@cdo/apps/util/color';

// The meter background is white, so add a background color to make
// the meter more easily visible.
const containerStyle = {
  backgroundColor: color.lightest_gray,
  padding: 10
};

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Meter',
  component: Meter
};

export const Basic = () => (
  <Meter
    id="meter-1"
    label="Glass half-full:"
    value={5}
    max={10}
    containerStyle={containerStyle}
  />
);

// import React from 'react';
// import Meter from '@cdo/apps/templates/Meter';

// export default storybook => {
//   return storybook.storiesOf('Meter', module).addStoryTable([
//     {
//       name: 'Half-full meter',
//       description: 'Displays the default meter color',
//       story: () => (
//         <Meter
//           id="meter-1"
//           label="Glass half-full:"
//           value={5}
//           max={10}
//           containerStyle={containerStyle}
//         />
//       )
//     },
//     {
//       name: '75%+ full meter',
//       description: 'Displays a warning meter color',
//       story: () => (
//         <Meter
//           id="meter-2"
//           label="Warning zone:"
//           value={8}
//           max={10}
//           containerStyle={containerStyle}
//         />
//       )
//     },
//     {
//       name: '90%+ full meter',
//       description: 'Displays a stronger warning meter color',
//       story: () => (
//         <Meter
//           id="meter-3"
//           label="Almost full!"
//           value={9}
//           max={10}
//           containerStyle={containerStyle}
//         />
//       )
//     },
//     {
//       name: 'Meter with no label',
//       story: () => (
//         <Meter
//           id="meter-4"
//           value={4}
//           max={10}
//           containerStyle={containerStyle}
//         />
//       )
//     }
//   ]);
// };
