
import {Meta, StoryFn} from '@storybook/react';

import PanelsLevel, {PanelsLevelProps} from '@code-dot-org/lab-panels';

export default {
  title: 'Labs/Panels',
  component: PanelsLevel,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<PanelsLevelProps> = args => (
  <div style={{width: '100vw', height: '100vh'}}>
    <PanelsLevel
      {...args}
    />
  </div>
);

export const Default = SingleTemplate.bind({});
Default.args = {
  levelData: {
    subData: {
      panels: [
        {
          imageUrl: "https://images.code.org/2843a02314c84e8efb37bfcfa95138ba-loop.gif",
          text: "###Repeat a sound\n\nChoose a sound and set the number of times to play it using a repeat block.\n","key":"musiclab_intro_panels_playtogether_pdx-a0d88b4a-e9a8-4641-8ec9-3ce98e7a1cc4",
        },
      ],
    },
  },
};
