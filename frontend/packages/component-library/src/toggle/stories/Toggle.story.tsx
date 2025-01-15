import {Meta, StoryFn} from '@storybook/react';

import {useState} from 'react';

import Toggle, {ToggleProps} from '../index';

export default {
  title: 'DesignSystem/Toggle',
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: Toggle.type,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
const SingleTemplate: StoryFn<ToggleProps> = args => <Toggle {...args} />;

const MultipleTemplate: StoryFn<{components: ToggleProps[]}> = args => {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(
      args.components?.map(component => [
        component.name,
        !!component.checked,
      ]) ?? [],
    ),
  );

  const handleToggleChange = (name: string, checked: boolean) => {
    setToggleStates(prevStates => ({
      ...prevStates,
      [name]: checked,
    }));
  };

  return (
    <>
      {args.components?.map(componentArg => (
        <Toggle
          key={componentArg.name}
          {...componentArg}
          checked={toggleStates[componentArg.name]}
          onChange={e =>
            handleToggleChange(componentArg.name, e.target.checked)
          }
        />
      ))}
    </>
  );
};

export const DefaultToggle = SingleTemplate.bind({});
DefaultToggle.args = {
  name: 'controlled_toggle',
  label: 'Toggle Label',
};

export const DefaultToggleGroup = MultipleTemplate.bind({});
DefaultToggleGroup.args = {
  components: [
    {
      name: 'test-left',
      label: 'Toggle left',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-right',
      label: 'Toggle right',
      position: 'right',
      checked: false,
      onChange: () => null,
    },
  ],
};

export const DisabledToggleGroup = MultipleTemplate.bind({});
DisabledToggleGroup.args = {
  components: [
    {
      name: 'test-disabled',
      label: 'Disabled toggle',
      disabled: true,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-disabled-checked',
      label: 'Disabled checked toggle',
      checked: true,
      disabled: true,
      onChange: () => null,
    },
  ],
};

export const SizesOfToggleGroup = MultipleTemplate.bind({});
SizesOfToggleGroup.args = {
  components: [
    {
      name: 'test-xs',
      label: 'Label - XS',
      size: 'xs',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-s',
      label: 'Label - S',
      size: 's',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-m',
      label: 'Label - M',
      size: 'm',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-l',
      label: 'Label - L',
      size: 'l',
      checked: false,
      onChange: () => null,
    },
  ],
};
