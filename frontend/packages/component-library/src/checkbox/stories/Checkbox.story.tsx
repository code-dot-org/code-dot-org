import {Meta, StoryFn} from '@storybook/react-webpack5';
import {useState, Dispatch, SetStateAction} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import Tags from '@/tags';

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
    setState: Dispatch<SetStateAction<Record<string, boolean>>>,
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

const CustomContentTemplate: StoryFn<{components: CheckboxProps[]}> = args => (
  <div style={{padding: 20}}>
    {args.components.map(c => (
      <Checkbox key={c.name} {...c} />
    ))}
  </div>
);

export const CheckboxesWithCustomContent = CustomContentTemplate.bind({});
CheckboxesWithCustomContent.args = {
  components: [
    {
      name: 'test-custom-content-0',
      label: '',
      size: 'm' as ComponentSizeXSToL,
      children: (
        <>
          <span>With Custom Content</span>
          <button type="button">Custom content</button>
        </>
      ),
    },
    {
      name: 'test-custom-content-1',
      label: 'With Custom Content and Label',
      size: 'm' as ComponentSizeXSToL,
      children: (
        <Tags
          tagsList={[
            {label: 'Tag1', tooltipContent: 'Tag tooltip', tooltipId: ''},
          ]}
        />
      ),
    },
    {
      name: 'test-custom-content-2',
      label: 'Without Custom Content',
      size: 'm' as ComponentSizeXSToL,
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

export const LabelWeights = MultipleTemplate.bind({});
LabelWeights.args = {
  components: [
    {
      name: 'lw-thin',
      label: 'Thin label',
      textThickness: 'thin',
      size: 'm' as ComponentSizeXSToL,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'lw-thick',
      label: 'Thick label',
      textThickness: 'thick',
      size: 'm' as ComponentSizeXSToL,
      checked: false,
      onChange: () => null,
    },
  ],
};

const MultiLineTemplate: StoryFn<{components: CheckboxProps[]}> = args => {
  const initial = Object.fromEntries(
    args.components.map(c => [c.name, !!c.checked]),
  );
  const [lightState, setLightState] =
    useState<Record<string, boolean>>(initial);
  const [darkState, setDarkState] = useState<Record<string, boolean>>(initial);

  const renderGroup = (
    state: Record<string, boolean>,
    setState: Dispatch<SetStateAction<Record<string, boolean>>>,
  ) => (
    <div style={{maxWidth: 220}}>
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

export const MultiLineLabels = MultiLineTemplate.bind({});
MultiLineLabels.args = {
  components: [
    {
      name: 'wrap-xs',
      size: 'xs' as ComponentSizeXSToL,
      label:
        'This is a quite long label intended to wrap onto multiple lines to demonstrate alignment.',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'wrap-s',
      size: 's' as ComponentSizeXSToL,
      label:
        'This is a quite long label intended to wrap onto multiple lines to demonstrate alignment.',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'wrap-m',
      size: 'm' as ComponentSizeXSToL,
      label:
        'This is a quite long label intended to wrap onto multiple lines to demonstrate alignment.',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'wrap-l',
      size: 'l' as ComponentSizeXSToL,
      label:
        'This is a quite long label intended to wrap onto multiple lines to demonstrate alignment.',
      checked: false,
      onChange: () => null,
    },
  ],
};
