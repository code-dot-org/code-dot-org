import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import SimpleList, {SimpleListProps} from '..';

type Story = StoryObj<typeof SimpleList> & {
  args: SimpleListProps | SimpleListProps[];
};

export default {
  title: 'DesignSystem/List/SimpleList',
  component: SimpleList,
  render: args => {
    const components: SimpleListProps[] = args[0]
      ? Object.values(args)
      : [args];
    return (
      <div style={{display: 'flex', gap: '5em'}}>
        {components.map((component, index) => (
          <SimpleList key={index} {...component} />
        ))}
      </div>
    );
  },
} as Meta;

const defaultArgs: SimpleListProps = {
  items: [{label: 'Item A'}, {label: 'Item B'}, {label: 'Item C'}],
};

const withIconArgs: SimpleListProps = {
  ...defaultArgs,
  icon: {
    iconName: 'check-circle',
  },
};

const getComputedStylePropValue = (property: string) =>
  window.getComputedStyle(document.body).getPropertyValue(property);

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: SimpleListProps;
  }) => {
    const canvas = within(canvasElement);

    const list = canvas.getByRole('list');
    expect(list).toHaveStyle('row-gap: 8px;');
    expect(list).toHaveStyle('column-gap: 8px;');

    args.items.forEach(item => {
      const listItemText = within(list).getByText(item.label as string);
      expect(listItemText).toHaveStyle('font-size: 16px;');
      expect(listItemText).toHaveStyle('font-weight: 400;');

      const listItem = listItemText.parentElement;
      expect(listItem).toHaveStyle('row-gap: 8px;');
      expect(listItem).toHaveStyle('column-gap: 8px;');

      const listItemIcon = listItemText.previousElementSibling;
      expect(listItemIcon).toHaveStyle('font-size: 12px;');
      expect(listItemIcon).toHaveStyle('font-weight: 900;');
      expect(listItemIcon).toHaveStyle(
        `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
      );
    });
  },
};

export const WithCustomIcon: Story = {
  args: {
    ...withIconArgs,
  },
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: SimpleListProps;
  }) => {
    const canvas = within(canvasElement);

    const list = canvas.getByRole('list');

    args.items.forEach(item => {
      const listItemText = within(list).getByText(item.label as string);

      const listItemIcon = listItemText.previousElementSibling;
      expect(listItemIcon).toHaveStyle('font-size: 16px;');
      expect(listItemIcon).toHaveStyle(
        `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
      );
    });
  },
};

export const Types: Story = {
  args: [
    {
      ...defaultArgs,
      type: 'primary',
      items: [
        {label: 'Primary Item A'},
        {label: 'Primary Item B'},
        {label: 'Primary Item C'},
      ],
    },
    {
      ...defaultArgs,
      type: 'secondary',
      items: [
        {label: 'Secondary Item A'},
        {label: 'Secondary Item B'},
        {label: 'Secondary Item C'},
      ],
    },
    {
      ...defaultArgs,
      type: 'brand',
      items: [
        {label: 'Brand Item A'},
        {label: 'Brand Item B'},
        {label: 'Brand Item C'},
      ],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      {iconColor: '--text-neutral-primary'}, // Primary Type
      {iconColor: '--text-neutral-placeholder'}, // Secondary Type
      {iconColor: '--text-brand-teal-primary'}, // Brand Type
    ].forEach(({iconColor}, index) => {
      const list = canvas.getAllByRole('list')[index];

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(
          `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
        );

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(
          `color: ${getComputedStylePropValue(iconColor)};`,
        );
      });
    });
  },
};

export const Sizes: Story = {
  args: [
    {
      ...defaultArgs,
      size: 'xs',
      items: [{label: 'XS Item A'}, {label: 'XS Item B'}, {label: 'XS Item C'}],
    },
    {
      ...defaultArgs,
      size: 's',
      items: [{label: 'S Item A'}, {label: 'S Item B'}, {label: 'S Item C'}],
    },
    {
      ...defaultArgs,
      size: 'm',
      items: [{label: 'M Item A'}, {label: 'M Item B'}, {label: 'M Item C'}],
    },
    {
      ...defaultArgs,
      size: 'l',
      items: [{label: 'L Item A'}, {label: 'L Item B'}, {label: 'L Item C'}],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      {gap: '4px', iconSize: '8px', labelSize: '13.008px'}, // XS Size
      {gap: '6px', iconSize: '10px', labelSize: '14px'}, // S Size
      {gap: '8px', iconSize: '12px', labelSize: '16px'}, // M Size
      {gap: '10px', iconSize: '14px', labelSize: '20px'}, // L Size
    ].forEach(({gap, iconSize, labelSize}, index) => {
      const list = canvas.getAllByRole('list')[index];
      expect(list).toHaveStyle(`row-gap: ${gap};`);
      expect(list).toHaveStyle(`column-gap: ${gap};`);

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(`font-size: ${labelSize};`);

        const listItem = listItemText.parentElement;
        expect(listItem).toHaveStyle(`row-gap: ${gap};`);
        expect(listItem).toHaveStyle(`column-gap: ${gap};`);

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(`font-size: ${iconSize};`);
      });
    });
  },
};

export const CustomIconSizes: Story = {
  args: [
    {
      ...withIconArgs,
      size: 'xs',
      items: [{label: 'XS Item A'}, {label: 'XS Item B'}, {label: 'XS Item C'}],
    },
    {
      ...withIconArgs,
      size: 's',
      items: [{label: 'S Item A'}, {label: 'S Item B'}, {label: 'S Item C'}],
    },
    {
      ...withIconArgs,
      size: 'm',
      items: [{label: 'M Item A'}, {label: 'M Item B'}, {label: 'M Item C'}],
      icon: {
        iconName: 'check-circle',
      },
    },
    {
      ...withIconArgs,
      size: 'l',
      items: [{label: 'L Item A'}, {label: 'L Item B'}, {label: 'L Item C'}],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      {gap: '4px', iconSize: '13.008px', labelSize: '13.008px'}, // XS Size
      {gap: '6px', iconSize: '14px', labelSize: '14px'}, // S Size
      {gap: '8px', iconSize: '16px', labelSize: '16px'}, // M Size
      {gap: '10px', iconSize: '20px', labelSize: '20px'}, // L Size
    ].forEach(({gap, iconSize, labelSize}, index) => {
      const list = canvas.getAllByRole('list')[index];
      expect(list).toHaveStyle(`row-gap: ${gap};`);
      expect(list).toHaveStyle(`column-gap: ${gap};`);

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(`font-size: ${labelSize};`);

        const listItem = listItemText.parentElement;
        expect(listItem).toHaveStyle(`row-gap: ${gap};`);
        expect(listItem).toHaveStyle(`column-gap: ${gap};`);

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(`font-size: ${iconSize};`);
      });
    });
  },
};

export const Weight: Story = {
  args: [
    {
      ...defaultArgs,
      weight: 'normal',
      items: [
        {label: 'Normal Item A'},
        {label: 'Normal Item B'},
        {label: 'Normal Item C'},
      ],
    },
    {
      ...defaultArgs,
      weight: 'bold',
      items: [
        {label: 'Bold Item A'},
        {label: 'Bold Item B'},
        {label: 'Bold Item C'},
      ],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      {iconWeight: 900, labelWeight: 400}, // Normal Weight
      {iconWeight: 900, labelWeight: 600}, // Bold Weight
    ].forEach(({iconWeight, labelWeight}, index) => {
      const list = canvas.getAllByRole('list')[index];

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(`font-weight: ${labelWeight};`);

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(`font-weight: ${iconWeight};`);
      });
    });
  },
};
