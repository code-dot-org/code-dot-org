import SimpleListContentful, {
  SimpleListContentfulProps,
} from '@/components/contentful/simpleList';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import SimpleListMock from './__mocks__/SimpleList.json';

const meta: Meta<SimpleListContentfulProps> = {
  title: 'Marketing/SimpleList',
  component: SimpleListContentful,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const Basic: StoryObj<SimpleListContentfulProps> = {
  args: SimpleListMock,
  play: async ({canvas}) => {
    // Check that all list items are rendered
    const items = await canvas.findAllByText(/List Item/);
    await expect(items.length).toBeGreaterThan(0);
    // Check that the first item text is present
    await expect(await canvas.findByText('List Item 1')).toBeInTheDocument();
  },
};

export const Smile: StoryObj<SimpleListContentfulProps> = {
  args: {
    ...SimpleListMock,
    size: 'm',
    weight: 'normal',
    iconName: 'smile',
    type: 'primary',
    children: null,
  },
  play: async ({canvas}) => {
    // Check that the smile icon is rendered by fa-smile class on <i> tag
    const smileIcons = Array.from(document.getElementsByTagName('i'));
    const foundSmile = smileIcons.some(icon =>
      (icon as HTMLElement).classList.contains('fa-smile'),
    );
    await expect(foundSmile).toBe(true);
    // Check that all list items are rendered
    const items = await canvas.findAllByText(/List Item/);
    await expect(items.length).toBeGreaterThan(0);
  },
};
