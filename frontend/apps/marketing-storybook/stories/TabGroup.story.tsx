/* eslint-disable @typescript-eslint/no-explicit-any */
import TabGroup from '@/components/contentful/tabGroup';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import TabGroupMock from './__mocks__/TabGroup.json';

const meta: Meta<typeof TabGroup> = {
  title: 'Marketing/TabGroup',
  component: TabGroup,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const FilledOut: StoryObj<typeof TabGroup> = {
  parameters: {
    layout: 'fullscreen',
  },
  args: TabGroupMock as any,
  play: async ({canvas}) => {
    const tabLabels = await canvas.findAllByRole('tab');
    await expect(tabLabels.length).toBeGreaterThan(0);
    for (const tab of tabLabels) {
      tab.click();
      const labelText = tab.textContent;
      const getVisibleText = async (text: string) => {
        const all = await canvas.findAllByText(text);
        return all.find(el => {
          let parent = el.parentElement;
          while (parent) {
            if (parent.tagName.toLowerCase() === 'details') return false;
            parent = parent.parentElement;
          }
          return true;
        });
      };
      if (labelText === 'Test Item Image and Button') {
        await expect(
          await getVisibleText('With image and button'),
        ).toBeInTheDocument();
      } else if (labelText === 'Test Item Text Only') {
        await expect(await getVisibleText('Text Only')).toBeInTheDocument();
        await expect(
          await getVisibleText('Without image, without button'),
        ).toBeInTheDocument();
      } else if (labelText === 'Test Item Button') {
        await expect(await getVisibleText('With Button')).toBeInTheDocument();
        await expect(
          await getVisibleText('Without image, with button'),
        ).toBeInTheDocument();
      } else if (labelText === 'Test Item Image') {
        await expect(await getVisibleText('With Image')).toBeInTheDocument();
        await expect(
          await getVisibleText('With image, without button'),
        ).toBeInTheDocument();
      }
    }
  },
};
