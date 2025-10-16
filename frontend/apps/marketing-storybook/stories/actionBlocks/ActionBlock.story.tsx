import ActionBlock, {
  ActionBlockContentfulProps,
} from '@/components/contentful/actionBlocks/defaultActionBlock';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import DefaultActionBlockMock from './__mocks__/defaultActionBlock.json';

const meta: Meta<typeof ActionBlock> = {
  title: 'Marketing/ActionBlocks/ActionBlock',
  component: ActionBlock,
};
export default meta;

type Story = StoryObj<typeof ActionBlock>;

function mockActionBlock(overrides: Partial<ActionBlockContentfulProps> = {}) {
  const contentfulDefinition: ActionBlockContentfulProps = {
    ...DefaultActionBlockMock,
    ...overrides,
  };

  return <ActionBlock {...contentfulDefinition} />;
}

export const WithAllContent: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
      {mockActionBlock()}
      {mockActionBlock({background: 'primary'})}
    </div>
  ),
  play: async ({canvas}) => {
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading: HTMLElement) =>
      expect(heading).toBeInTheDocument(),
    );
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link: HTMLElement) => expect(link).toBeInTheDocument());
  },
};

export const WithSecondaryBackground: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
      {mockActionBlock()}
      {mockActionBlock({background: 'secondary'})}
    </div>
  ),
  play: async ({canvas}) => {
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading: HTMLElement) =>
      expect(heading).toBeInTheDocument(),
    );
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link: HTMLElement) => expect(link).toBeInTheDocument());
  },
};

export const ThreeAcross: Story = {
  render: () => (
    <div
      style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}
    >
      {Array.from({length: 3}).map((_, idx) => (
        <div key={idx}>{mockActionBlock()}</div>
      ))}
    </div>
  ),
  play: async ({canvas}) => {
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading: HTMLElement) =>
      expect(heading).toBeInTheDocument(),
    );
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link: HTMLElement) => expect(link).toBeInTheDocument());
  },
};
