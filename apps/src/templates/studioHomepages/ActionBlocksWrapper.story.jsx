import React from 'react';

import ActionBlocksWrapper from './ActionBlocksWrapper';

export default {
  component: ActionBlocksWrapper,
};

const generateActionBlocks = tileCount => {
  const actionBlocks = [];
  for (let i = 0; i < tileCount; i++) {
    actionBlocks.push({
      overline: `Overline ${i + 1}`,
      imageUrl:
        'https://code.org/images/dance-hoc/dance-party-activity-ai-edition.png',
      heading: `Heading ${i + 1}`,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit.',
      buttons: [
        {
          color: 'purple',
          url: '#',
          text: 'Primary button',
          ariaLabel: 'Aria label goes here',
        },
        {
          color: 'black',
          url: '#',
          text: 'Secondary button',
          type: 'secondary',
        },
      ],
    });
  }
  return actionBlocks;
};

export const TwoColumns = () => {
  const actionBlocks = generateActionBlocks(2);
  return <ActionBlocksWrapper actionBlocks={actionBlocks} />;
};

export const ThreeColumns = () => {
  const actionBlocks = generateActionBlocks(3);
  return <ActionBlocksWrapper actionBlocks={actionBlocks} />;
};

export const SixTiles = () => {
  const actionBlocks = generateActionBlocks(6);
  return <ActionBlocksWrapper actionBlocks={actionBlocks} />;
};
