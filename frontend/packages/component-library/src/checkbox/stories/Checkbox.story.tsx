import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {ComponentSizeXSToL} from '@/common/types';

import Checkbox, {CheckboxProps} from '../index';

export default {
  title: 'DesignSystem/Checkbox',
  component: Checkbox,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<CheckboxProps> = args => {
  const [lightChecked, setLightChecked] = useState(args.checked ?? false);
  const [darkChecked, setDarkChecked] = useState(args.checked ?? false);

  const Single = (checked: boolean, onChange: (newVal: boolean) => void) => (
    <Checkbox
      {...args}
      checked={checked}
      onChange={e => {
        onChange(e.target.checked);
        args.onChange?.(e);
      }}
    />
  );

  return (
    <>
      <div data-theme="Light" style={{padding: 20}}>
        <h3>Light Theme</h3>
        {Single(lightChecked, setLightChecked)}
      </div>
      <div data-theme="Dark" style={{background: '#292F36', padding: 20}}>
        <h3 style={{color: '#FFF'}}>Dark Theme</h3>
        {Single(darkChecked, setDarkChecked)}
      </div>
    </>
  );
};

export const DefaultCheckbox = SingleTemplate.bind({});
DefaultCheckbox.args = {
  name: 'controlled_checkbox',
  label: 'Checkbox Label',
  checked: false,
  onChange: () => null,
};

const MultipleTemplate: StoryFn<{components: CheckboxProps[]}> = args => {
  const initial = Object.fromEntries(
    args.components.map(c => [c.name, !!c.checked]),
  );
  const [lightState, setLightState] =
    useState<Record<string, boolean>>(initial);
  const [darkState, setDarkState] = useState<Record<string, boolean>>(initial);

  const renderGroup = (
    state: Record<string, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  ) => (
    <div>
      {args.components.map(c => (
        <Checkbox
          key={c.name}
          {...c}
          checked={state[c.name]}
          onChange={e => {
            const next = {...state, [c.name]: e.target.checked};
            setState(next);
            c.onChange?.(e);
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      <div data-theme="Light" style={{padding: 20}}>
        <h3>Light Theme</h3>
        {renderGroup(lightState, setLightState)}
      </div>
      <div data-theme="Dark" style={{background: '#292F36', padding: 20}}>
        <h3 style={{color: '#FFF'}}>Dark Theme</h3>
        {renderGroup(darkState, setDarkState)}
      </div>
    </>
  );
};

export const GroupOfDefaultCheckboxes = MultipleTemplate.bind({});
GroupOfDefaultCheckboxes.args = {
  components: [
    {name: 'test', label: 'Label', checked: false, onChange: () => null},
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
      disabled: true,
      checked: false,
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
      size: 'xs' as ComponentSizeXSToL,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-s',
      label: 'Label S',
      size: 's' as ComponentSizeXSToL,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-m',
      label: 'Label M',
      size: 'm' as ComponentSizeXSToL,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-l',
      label: 'Label L',
      size: 'l' as ComponentSizeXSToL,
      checked: false,
      onChange: () => null,
    },
  ],
};

//
// ———————————————————————————————————————————————————
// Supernova documentation (Light theme only)
// ———————————————————————————————————————————————————
// These examples are purely for Supernova docs and will not include a Dark theme.

const SupernovaDefaultTemplate: StoryFn<CheckboxProps> = () => (
  <>
    <div style={{display: 'flex', justifyContent: 'space-around', padding: 20}}>
      {[
        {
          name: 'sn-test',
          label: 'Checkbox',
          checked: false,
          onChange: () => null,
        },
        {
          name: 'sn-test-checked',
          label: 'Checkbox',
          checked: true,
          onChange: () => null,
        },
        {
          name: 'sn-test-indet',
          label: 'Checkbox Indeterminate',
          indeterminate: true,
          checked: false,
          onChange: () => null,
        },
      ].map(props => (
        <Checkbox key={props.name} {...props} />
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around', padding: 20}}>
      {[
        {
          name: 'sn-test',
          label: 'Checkbox',
          disabled: true,
          checked: false,
          onChange: () => null,
        },
        {
          name: 'sn-test-checked',
          label: 'Checkbox',
          disabled: true,
          checked: true,
          onChange: () => null,
        },
        {
          name: 'sn-test-indet',
          label: 'Checkbox Indeterminate',
          disabled: true,
          indeterminate: true,
          checked: false,
          onChange: () => null,
        },
      ].map(props => (
        <Checkbox key={props.name + '-disabled'} {...props} />
      ))}
    </div>
  </>
);

export const SupernovaGroupOfDefaultCheckboxes = SupernovaDefaultTemplate.bind(
  {},
);

const SupernovaSizesTemplate: StoryFn<CheckboxProps> = () => (
  <div style={{display: 'flex', justifyContent: 'space-around', padding: 20}}>
    {[
      {
        name: 'sn-xs',
        label: 'Checkbox XS',
        checked: false,
        size: 'xs' as ComponentSizeXSToL,
        onChange: () => null,
      },
      {
        name: 'sn-s',
        label: 'Checkbox S',
        checked: false,
        size: 's' as ComponentSizeXSToL,
        onChange: () => null,
      },
      {
        name: 'sn-m',
        label: 'Checkbox M',
        checked: false,
        size: 'm' as ComponentSizeXSToL,
        onChange: () => null,
      },
      {
        name: 'sn-l',
        label: 'Checkbox L',
        checked: false,
        size: 'l' as ComponentSizeXSToL,
        onChange: () => null,
      },
    ].map(props => (
      <Checkbox key={props.name} {...props} />
    ))}
  </div>
);

export const SupernovaGroupOfCheckboxesSizes = SupernovaSizesTemplate.bind({});
