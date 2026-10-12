import {Meta, StoryFn} from '@storybook/react-vite';
import {ChangeEvent, MouseEvent, useState, useCallback} from 'react';
import {expect, userEvent, within} from 'storybook/test';

import CheckboxDropdown, {CheckboxDropdownProps} from '../index';

import {dropdownColors} from './../../index';

export default {
  title: 'DesignSystem/Dropdown/Checkbox Dropdown',
  component: CheckboxDropdown,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<CheckboxDropdownProps> = args => {
  const [selectedValues, setValues] = useState(args.checkedOptions as string[]);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setValues([...selectedValues, e.target.value]);
      } else {
        setValues(selectedValues.filter(value => value !== e.target.value));
      }
      args.onChange(e);
    },
    [args, selectedValues, setValues],
  );
  const onSelectAll = useCallback(
    (e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>) => {
      setValues(args.allOptions.map(option => option.value));
      if (!args.hideControls) {
        args.onSelectAll(e);
      }
    },
    [args],
  );
  const onClearAll = useCallback(
    (e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>) => {
      setValues([]);
      if (!args.hideControls) {
        args.onClearAll(e);
      }
    },
    [args],
  );

  if (!args.hideControls) {
    return (
      <CheckboxDropdown
        {...args}
        checkedOptions={selectedValues}
        onChange={onChange}
        onSelectAll={onSelectAll}
        onClearAll={onClearAll}
        selectAllText="Select all"
        clearAllText="Clear all"
        doneText="Done"
      />
    );
  } else {
    return (
      <CheckboxDropdown
        {...args}
        checkedOptions={selectedValues}
        onChange={onChange}
      />
    );
  }
};

const MultipleTemplate: StoryFn<{
  components: CheckboxDropdownProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, string[]>);

  return (
    <>
      <p>
        * Margins on this screen does not represent Component's margins, and are
        only added to improve storybook view *
      </p>
      <p>Multiple Dropdown:</p>
      <div style={{display: 'flex', gap: '20px'}}>
        {args.components?.map(componentArg => {
          if (values[componentArg.name] === undefined) {
            setValues({
              ...values,
              [componentArg.name]: componentArg.checkedOptions,
            });
          }

          const onChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
              setValues({
                ...values,
                [componentArg.name]: [
                  ...values[componentArg.name],
                  e.target.value,
                ],
              });
            } else {
              setValues({
                ...values,
                [componentArg.name]: values[componentArg.name].filter(
                  value => value !== e.target.value,
                ),
              });
            }
            componentArg.onChange(e);
          };
          const onSelectAll = (
            e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>,
          ) => {
            setValues({
              ...values,
              [componentArg.name]: componentArg.allOptions.map(
                option => option.value,
              ),
            });
            if (!componentArg.hideControls) {
              componentArg.onSelectAll(e);
            }
          };
          const onClearAll = (
            e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>,
          ) => {
            setValues({...values, [componentArg.name]: []});
            if (!componentArg.hideControls) {
              componentArg.onClearAll(e);
            }
          };

          if (!componentArg.hideControls) {
            return (
              <CheckboxDropdown
                key={`${componentArg.name}`}
                {...componentArg}
                checkedOptions={
                  values[componentArg.name] || componentArg.checkedOptions
                }
                onChange={onChange}
                onSelectAll={onSelectAll}
                onClearAll={onClearAll}
              />
            );
          } else {
            return (
              <CheckboxDropdown
                key={`${componentArg.name}`}
                {...componentArg}
                checkedOptions={
                  values[componentArg.name] || componentArg.checkedOptions
                }
                onChange={onChange}
              />
            );
          }
        })}
      </div>
    </>
  );
};

export const DefaultCheckboxDropdown = SingleTemplate.bind({});
DefaultCheckboxDropdown.args = {
  name: 'default-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  labelText: 'Default Dropdown',
  checkedOptions: ['option-1'],
  disabled: false,
  color: dropdownColors.black,
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  size: 'm',
};

// Twenty options is enough to reach the menu max-height.
const longListOptions = Array.from({length: 20}, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}));

export const LongListCheckboxDropdown = SingleTemplate.bind({});
LongListCheckboxDropdown.args = {
  name: 'long-list-dropdown',
  allOptions: longListOptions,
  labelText: 'Long list',
  checkedOptions: ['option-1'],
  disabled: false,
  color: dropdownColors.black,
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  size: 'm',
};
LongListCheckboxDropdown.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', {
    name: /long-list-dropdown filter dropdown/i,
  });
  await userEvent.click(trigger);

  const list = canvasElement.querySelector('ul');
  const menu = list?.parentElement;
  const actions = canvas.getByRole('button', {name: 'Done (1)'});
  expect(list).not.toBeNull();
  expect(menu).not.toBeNull();
  if (!list || !menu) {
    return;
  }

  const items = [...list.querySelectorAll('li')];
  expect(items).toHaveLength(longListOptions.length);
  items.forEach(item => {
    expect(item.querySelector('input[type="checkbox"]')).not.toBeNull();
  });
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

  const menuBottom = menu.getBoundingClientRect().bottom;
  const actionBottom = actions.getBoundingClientRect().bottom;
  expect(Math.abs(menuBottom - actionBottom)).toBeLessThan(2);
  expect(menu.getBoundingClientRect().width).toBeGreaterThanOrEqual(
    trigger.getBoundingClientRect().width - 1,
  );
};

export const NoSelectOrClearAllCheckboxDropdown = SingleTemplate.bind({});
NoSelectOrClearAllCheckboxDropdown.args = {
  name: 'no-select-all-or-clear-all-dropdown',
  hideControls: true,
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  labelText: 'No Select All or Clear All Dropdown',
  checkedOptions: ['option-1'],
  disabled: false,
  color: dropdownColors.black,
  onChange: () => null,
  size: 'm',
};

export const ReadOnlyCheckboxDropdown = SingleTemplate.bind({});
ReadOnlyCheckboxDropdown.args = {
  name: 'readOnly-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'ReadOnly Dropdown',
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  readOnly: true,
  color: dropdownColors.black,
  size: 'm',
};

export const DisabledCheckboxDropdown = SingleTemplate.bind({});
DisabledCheckboxDropdown.args = {
  name: 'disabled-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Disabled Dropdown',
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  disabled: true,
  color: dropdownColors.black,
  size: 'm',
};

export const WithDisabledOptionCheckboxDropdown = SingleTemplate.bind({});
WithDisabledOptionCheckboxDropdown.args = {
  name: 'withDisabledOption-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1', isOptionDisabled: true},
    {value: 'option-2', label: 'Option 2'},
    {value: 'option-3', label: 'Option 3'},
  ],
  disabled: false,
  color: dropdownColors.black,
  checkedOptions: ['option-1'],
  labelText: 'Dropdown with disabled option',
  onChange: () => null,
  onSelectAll: () => null,
  onClearAll: () => null,
  size: 'm',
};

export const StyledAsFieldCheckboxDropdown = SingleTemplate.bind({});
StyledAsFieldCheckboxDropdown.args = {
  name: 'styled-as-field-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Helper Message Checkbox Dropdown',
  onChange: args => console.log(args),
  helperMessage: 'Helper message',
  styleAsFormField: true,
  size: 'm',
};
StyledAsFieldCheckboxDropdown.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', {
    name: /styled-as-field-checkbox-dropdown filter dropdown/i,
  });
  await userEvent.click(trigger);

  const menu = canvasElement.querySelector('ul')?.parentElement;
  expect(menu).not.toBeNull();
  if (!menu) {
    return;
  }

  expect(menu.getBoundingClientRect().width).toBeGreaterThanOrEqual(
    trigger.getBoundingClientRect().width - 1,
  );
};

export const WithErrorCheckboxDropdown = SingleTemplate.bind({});
WithErrorCheckboxDropdown.args = {
  name: 'error-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Error Checkbox Dropdown',
  onChange: args => console.log(args),
  errorMessage: 'Error message',
  size: 'm',
};

export const WithHelperMessageCheckboxDropdown = SingleTemplate.bind({});
WithHelperMessageCheckboxDropdown.args = {
  name: 'helper-message-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Helper Message Checkbox Dropdown',
  onChange: args => console.log(args),
  helperMessage: 'Helper message',
  size: 'm',
};

export const WithHelperMessageAndIconCheckboxDropdown = SingleTemplate.bind({});
WithHelperMessageAndIconCheckboxDropdown.args = {
  name: 'helper-icon-checkbox-dropdown',
  allOptions: [
    {value: 'option-1', label: 'Option 1'},
    {value: 'option-2', label: 'Option 2'},
  ],
  checkedOptions: ['option-1'],
  labelText: 'Helper Icon Checkbox Dropdown',
  onChange: args => console.log(args),
  helperIcon: {
    iconName: 'info-circle',
  },
  helperMessage: 'Helper message',
  size: 'm',
};

export const ThickAndThinCheckboxDropdowns = MultipleTemplate.bind({});
ThickAndThinCheckboxDropdowns.args = {
  components: [
    {
      name: 'thick-dropdown',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Thick Dropdown',
      labelType: 'thick',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      disabled: false,
    },
    {
      name: 'thin-dropdown',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Thin Dropdown',
      labelType: 'thin',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      disabled: false,
    },
  ],
};

export const GroupOfCheckboxDropdownColors = MultipleTemplate.bind({});
GroupOfCheckboxDropdownColors.args = {
  components: [
    {
      name: 'default-dropdown-white',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'White Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      disabled: false,
      color: dropdownColors.white,
    },
    {
      name: 'default-dropdown-black',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Black Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
    },
    {
      name: 'default-dropdown-gray',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Gray Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.gray,
      disabled: false,
    },
  ],
};

export const GroupOfSizesOfCheckboxDropdown = MultipleTemplate.bind({});
GroupOfSizesOfCheckboxDropdown.args = {
  components: [
    {
      name: 'default-dropdown-xs',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'XS Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'xs',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-s',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'S Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 's',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-m',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'M Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      disabled: false,
      color: dropdownColors.black,
    },
    {
      name: 'default-dropdown-white',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'L Dropdown',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'l',
      disabled: false,
      color: dropdownColors.black,
    },
  ],
};

export const GroupOfMenuPlacementOptions = MultipleTemplate.bind({});
GroupOfMenuPlacementOptions.args = {
  components: [
    {
      name: 'menu-placement-left',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Placement Left',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
      menuPlacement: 'left',
    },
    {
      name: 'menu-placement-right',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Placement Right',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
      menuPlacement: 'right',
    },
  ],
};

export const GroupOfMenuVerticalPlacementOptions = MultipleTemplate.bind({});
GroupOfMenuVerticalPlacementOptions.args = {
  components: [
    {
      name: 'menu-vertical-top',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Vertical Top',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
      menuVerticalPlacement: 'top',
    },
    {
      name: 'menu-vertical-bottom',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Vertical Bottom',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      disabled: false,
      menuVerticalPlacement: 'bottom',
    },
  ],
};

export const GroupOfAllPlacements = MultipleTemplate.bind({});
GroupOfAllPlacements.args = {
  components: [
    {
      name: 'placement-left-bottom',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Left + Bottom',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      menuPlacement: 'left',
      menuVerticalPlacement: 'bottom',
    },
    {
      name: 'placement-right-bottom',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Right + Bottom',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      menuPlacement: 'right',
      menuVerticalPlacement: 'bottom',
    },
    {
      name: 'placement-left-top',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Left + Top',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      menuPlacement: 'left',
      menuVerticalPlacement: 'top',
    },
    {
      name: 'placement-right-top',
      allOptions: [
        {value: 'option-1', label: 'Option 1'},
        {value: 'option-2', label: 'Option 2'},
      ],
      checkedOptions: ['option-1'],
      labelText: 'Right + Top',
      onChange: () => null,
      onSelectAll: () => null,
      onClearAll: () => null,
      selectAllText: 'Select All',
      clearAllText: 'Clear All',
      doneText: 'Done',
      size: 'm',
      color: dropdownColors.black,
      menuPlacement: 'right',
      menuVerticalPlacement: 'top',
    },
  ],
};
