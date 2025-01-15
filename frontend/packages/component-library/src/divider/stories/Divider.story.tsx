import {Meta, StoryFn} from '@storybook/react';

import Divider, {DividerProps} from '../index';

export default {
  title: 'DesignSystem/Divider',
  component: Divider,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<DividerProps> = args => <Divider {...args} />;

const MultipleTemplate: StoryFn<{
  components: DividerProps[];
}> = args => (
  <>
    <p>
      {args.components.some(componentArg => componentArg.margin)
        ? '* Gray background exists to show spacing, it will not appear with component *'
        : "* Margins on this screen do not represent Component's margins, and are only added to improve storybook view *"}
    </p>

    <p>Multiple Dividers:</p>
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      {args.components?.map((componentArg, index) => (
        <div
          key={index}
          style={{
            background: componentArg.margin ? '#646464' : 'transparent',
          }}
        >
          <Divider {...componentArg} />
        </div>
      ))}
    </div>
  </>
);

export const DefaultDivider = SingleTemplate.bind({});
DefaultDivider.args = {
  color: 'primary',
};

export const GroupOfDividers = MultipleTemplate.bind({});
GroupOfDividers.args = {
  components: [{color: 'primary'}, {color: 'strong'}],
};

export const GroupOfDividersWithMargin = MultipleTemplate.bind({});
GroupOfDividersWithMargin.args = {
  components: [
    {color: 'primary', margin: 'none'},
    {color: 'primary', margin: 'xs'},
    {color: 'primary', margin: 's'},
    {color: 'primary', margin: 'm'},
    {color: 'primary', margin: 'l'},
  ],
};
