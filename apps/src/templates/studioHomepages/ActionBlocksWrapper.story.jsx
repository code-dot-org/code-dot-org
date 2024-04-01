import React from 'react';
import ActionBlocksWrapper from './ActionBlocksWrapper';

export default {
  component: ActionBlocksWrapper,
};

const generateActionBlocks = count => {
  const actionBlocks = [];
  for (let i = 0; i < count; i++) {
    actionBlocks.push({
      overline: `Overline ${i + 1}`,
      imageUrl:
        'https://code.org/images/dance-hoc/dance-party-activity-ai-edition.png',
      heading: `Heading ${i + 1}`,
      description: `Description ${i + 1}`,
      buttons: [
        {
          color: 'purple',
          url: '#',
          text: 'Primary button',
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
