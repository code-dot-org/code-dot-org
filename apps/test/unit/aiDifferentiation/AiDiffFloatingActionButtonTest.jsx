import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('AIDiffFloatingActionButton', () => {
  it('begins closed', () => {
    render(<AiDiffFloatingActionButton />);
    expect(screen.getByText('AI Teaching Assistant')).not.be.visible;
  });

  it('opens on click', () => {
    render(<AiDiffFloatingActionButton />);
    fireEvent.click(screen.getByRole('button', {name: 'AI bot'}));
    expect(screen.getByText('AI Teaching Assistant')).to.be.visible;
  });
});
