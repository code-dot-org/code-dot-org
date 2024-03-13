import React from 'react';
import Tabs, {TabsProps} from './index';
import {Meta, Story} from '@storybook/react';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

export default {
  title: 'DesignSystem/Tabs', // eslint-disable-line storybook/no-title-property-in-meta
  component: Tabs,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: Story<TabsProps> = args => <Tabs {...args} />;

const MultipleTemplate: Story<{
  components: TabsProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Tabs key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultTabs = SingleTemplate.bind({});
DefaultTabs.args = {
  name: 'controlled_checkbox',
  label: 'Tabs Label',
};
//
export const GroupOfDefaultTabs = MultipleTemplate.bind({});
GroupOfDefaultTabs.args = {
  components: [
    {
      name: 'test',
      label: 'Label',
      onChange: () => null,
      checked: false,
    },
    {
      name: 'test-checked',
      label: 'Label Checked',
      checked: true,
      onChange: () => null,
    },
    {
      name: 'test-indeterminate',
      label: 'Label Indeterminate',
      indeterminate: true,
      checked: false,
      onChange: () => null,
    },
  ],
};

export const GroupOfDisabledTabs = MultipleTemplate.bind({});
GroupOfDisabledTabs.args = {
  components: [
    {
      name: 'test-disabled',
      label: 'Label',
      disabled: true,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-disabled-checked',
      label: 'Label Checked',
      disabled: true,
      checked: true,
      onChange: () => null,
    },
    {
      name: 'test-disabled-indeterminate',
      label: 'Label Indeterminate',
      indeterminate: true,
      checked: false,
      disabled: true,
      onChange: () => null,
    },
  ],
};

export const GroupOfSizesOfTabs = MultipleTemplate.bind({});
GroupOfSizesOfTabs.args = {
  components: [
    {
      name: 'test-xs',
      label: 'Label XS',
      size: 'xs',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-s',
      label: 'Label S',
      size: 's',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-m',
      label: 'Label M',
      size: 'm',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-xl',
      label: 'Label XL',
      size: 'l',
      checked: false,
      onChange: () => null,
    },
  ],
};

// -----------------------------------------------------------
// Stories under this line are for Supernova Documentation only
// -----------------------------------------------------------
const SupernovaDefaultMultipleTemplate: Story<{
  components: TabsProps[];
}> = () => (
  <>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs',
          onChange: () => null,
          checked: false,
        },
        {
          name: 'test-checked',
          label: 'Tabs',
          checked: true,
          onChange: () => null,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs',
          indeterminate: true,
          checked: false,
          onChange: () => null,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs',
          onChange: () => null,
          checked: false,
          disabled: true,
        },
        {
          name: 'test-checked',
          label: 'Tabs',
          checked: true,
          disabled: true,
          onChange: () => null,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs',
          indeterminate: true,
          checked: false,
          disabled: true,
          onChange: () => null,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
  </>
);

export const SupernovaGroupOfDefaultTabs =
  SupernovaDefaultMultipleTemplate.bind({});

const SupernovaSizesMultipleTemplate: Story<{
  components: TabsProps[];
}> = () => (
  <>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs XS',
          onChange: () => null,
          checked: false,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Tabs S',
          checked: false,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs M',
          checked: false,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs L',
          checked: false,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs XS',
          onChange: () => null,
          checked: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Tabs S',
          checked: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs M',
          checked: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs L',
          checked: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs XS',
          onChange: () => null,
          checked: false,
          indeterminate: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Tabs S',
          checked: false,
          indeterminate: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs M',
          checked: false,
          indeterminate: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs L',
          checked: false,
          indeterminate: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs XS',
          onChange: () => null,
          checked: true,
          disabled: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Tabs S',
          checked: true,
          disabled: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs M',
          checked: true,
          disabled: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs L',
          checked: true,
          disabled: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Tabs XS',
          onChange: () => null,
          checked: false,
          indeterminate: true,
          disabled: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Tabs S',
          checked: false,
          indeterminate: true,
          disabled: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs M',
          checked: false,
          indeterminate: true,
          disabled: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Tabs L',
          checked: false,
          indeterminate: true,
          disabled: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Tabs key={componentArg.name} {...componentArg} />
      ))}
    </div>
  </>
);

// export const SupernovaGroupOfTabsSizes = SupernovaSizesMultipleTemplate.bind(
//   {}
// );
