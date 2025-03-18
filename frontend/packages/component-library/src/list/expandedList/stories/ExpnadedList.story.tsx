import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import ExpandedList, {ExpandedListProps} from '..';

type Story = StoryObj<typeof ExpandedList>;

export default {
  title: 'DesignSystem/List/ExpandedList',
  component: ExpandedList,
} as Meta<ExpandedListProps>;

const defaultArgs: ExpandedListProps = {
  items: [
    {key: 'item-a', label: 'Item A', content: 'Item A Content'},
    {key: 'item-b', label: 'Item B', content: 'Item B Content'},
    {key: 'item-c', label: 'Item C', content: 'Item C Content'},
  ],
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
    args: ExpandedListProps;
  }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');

    args.items.forEach(item => {
      const listItemText = within(list).getByText(item.label as string);
      const listItemIcon = listItemText.previousElementSibling;

      expect(listItemIcon).toHaveStyle('font-size: 32px;');
      expect(listItemIcon).toHaveStyle('font-weight: 900;');
      expect(listItemIcon).toHaveStyle(
        `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
      );
    });
  },
};

export const WithCustomIcon: Story = {
  args: {
    ...defaultArgs,
    icon: {
      iconName: 'check-circle',
      iconStyle: 'regular',
    },
  },
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: ExpandedListProps;
  }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');

    args.items.forEach(item => {
      const listItemText = within(list).getByText(item.label as string);
      const listItemIcon = listItemText.previousElementSibling;

      expect(listItemIcon).toHaveStyle('font-size: 32px;');
      expect(listItemIcon).toHaveStyle('font-weight: 400;');
      expect(listItemIcon).toHaveStyle(
        `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
      );
    });
  },
};
