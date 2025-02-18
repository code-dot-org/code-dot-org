import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('SuggestedPrompts', () => {
  it('shows correct set of prompts', () => {
    const prompts = [
      {
        label: 'very visible prompt',
        onClick: () => {},
        show: true,
        selected: false,
      },
      {
        label: 'invisible prompt',
        onClick: () => {},
        show: false,
        selected: false,
      },
      {
        label: 'another visible prompt',
        onClick: () => {},
        show: true,
        selected: false,
      },
    ];
    render(<SuggestedPrompts suggestedPrompts={prompts} />);
    expect(screen.queryByText('invisible prompt')).to.be.null;
    expect(screen.getByText('very visible prompt')).to.be.visible;
    expect(screen.getByText('another visible prompt')).to.be.visible;
  });

  it('calls correct onClick callback on unselected item', async () => {
    const callback = prompt => {
      prompts.push({
        label: `${prompt.label} duplicate`,
        onClick: () => {},
        show: true,
        selected: false,
      });
      render(<SuggestedPrompts suggestedPrompts={prompts} />);
    };
    const prompts = [
      {
        label: 'very visible prompt',
        onClick: callback,
        show: true,
        selected: false,
      },
      {
        label: 'invisible prompt',
        onClick: callback,
        show: false,
        selected: false,
      },
      {
        label: 'another visible prompt',
        onClick: callback,
        show: true,
        selected: false,
      },
    ];
    render(<SuggestedPrompts suggestedPrompts={prompts} />);
    fireEvent.click(screen.getByText('very visible prompt'));
    await screen.findByText('very visible prompt duplicate');
  });

  it('calls correct onClick callback on selected item', async () => {
    const callback = prompt => {
      prompts.push({
        label: `${prompt.label} duplicate`,
        onClick: () => {},
        show: true,
        selected: false,
      });
      render(<SuggestedPrompts suggestedPrompts={prompts} />);
    };
    const prompts = [
      {
        label: 'very visible prompt',
        onClick: callback,
        show: true,
        selected: true,
      },
      {
        label: 'invisible prompt',
        onClick: callback,
        show: false,
        selected: true,
      },
      {
        label: 'another visible prompt',
        onClick: callback,
        show: true,
        selected: true,
      },
    ];
    render(<SuggestedPrompts suggestedPrompts={prompts} />);
    fireEvent.click(screen.getByText('another visible prompt'));
    await screen.findByText('another visible prompt duplicate');
  });
});
