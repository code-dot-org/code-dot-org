import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import Checkbox, {CheckboxProps} from './index';

export default {
  title: 'DesignSystem/Checkbox', // eslint-disable-line storybook/no-title-property-in-meta
  component: Checkbox,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<CheckboxProps> = args => <Checkbox {...args} />;

const MultipleTemplate: StoryFn<{
  components: CheckboxProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Checkbox key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultCheckbox = SingleTemplate.bind({});
DefaultCheckbox.args = {
  name: 'controlled_checkbox',
  label: 'Checkbox Label',
};
//
export const GroupOfDefaultCheckboxes = MultipleTemplate.bind({});
GroupOfDefaultCheckboxes.args = {
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

export const GroupOfDisabledCheckboxes = MultipleTemplate.bind({});
GroupOfDisabledCheckboxes.args = {
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

export const GroupOfSizesOfCheckboxes = MultipleTemplate.bind({});
GroupOfSizesOfCheckboxes.args = {
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
const SupernovaDefaultMultipleTemplate: StoryFn<{
  components: CheckboxProps[];
}> = () => (
  <>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox',
          onChange: () => null,
          checked: false,
        },
        {
          name: 'test-checked',
          label: 'Checkbox',
          checked: true,
          onChange: () => null,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox',
          indeterminate: true,
          checked: false,
          onChange: () => null,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox',
          onChange: () => null,
          checked: false,
          disabled: true,
        },
        {
          name: 'test-checked',
          label: 'Checkbox',
          checked: true,
          disabled: true,
          onChange: () => null,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox',
          indeterminate: true,
          checked: false,
          disabled: true,
          onChange: () => null,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
  </>
);

export const SupernovaGroupOfDefaultCheckboxes =
  SupernovaDefaultMultipleTemplate.bind({});

const SupernovaSizesMultipleTemplate: StoryFn<{
  components: CheckboxProps[];
}> = () => (
  <>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox XS',
          onChange: () => null,
          checked: false,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Checkbox S',
          checked: false,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox M',
          checked: false,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox L',
          checked: false,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox XS',
          onChange: () => null,
          checked: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Checkbox S',
          checked: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox M',
          checked: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox L',
          checked: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox XS',
          onChange: () => null,
          checked: false,
          indeterminate: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Checkbox S',
          checked: false,
          indeterminate: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox M',
          checked: false,
          indeterminate: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox L',
          checked: false,
          indeterminate: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox XS',
          onChange: () => null,
          checked: true,
          disabled: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Checkbox S',
          checked: true,
          disabled: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox M',
          checked: true,
          disabled: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox L',
          checked: true,
          disabled: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {[
        {
          name: 'test',
          label: 'Checkbox XS',
          onChange: () => null,
          checked: false,
          indeterminate: true,
          disabled: true,
          size: 'xs' as ComponentSizeXSToL,
        },
        {
          name: 'test-checked',
          label: 'Checkbox S',
          checked: false,
          indeterminate: true,
          disabled: true,
          onChange: () => null,
          size: 's' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox M',
          checked: false,
          indeterminate: true,
          disabled: true,
          onChange: () => null,
          size: 'm' as ComponentSizeXSToL,
        },
        {
          name: 'test-indeterminate',
          label: 'Checkbox L',
          checked: false,
          indeterminate: true,
          disabled: true,
          onChange: () => null,
          size: 'l' as ComponentSizeXSToL,
        },
      ]?.map(componentArg => (
        <Checkbox key={componentArg.name} {...componentArg} />
      ))}
    </div>
  </>
);

export const SupernovaGroupOfCheckboxesSizes =
  SupernovaSizesMultipleTemplate.bind({});
