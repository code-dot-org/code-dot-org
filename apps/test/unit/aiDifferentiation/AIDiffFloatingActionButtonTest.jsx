import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AIDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AIDiffFloatingActionButton';

import {expect} from '../../util/reconfiguredChai';

describe('AIDiffFloatingActionButton', () => {
  it('begins closed', () => {
    render(<AIDiffFloatingActionButton />);
    expect(screen.getByText('AI Teaching Assistant')).not.be.visible;
  });

  it('opens on click', () => {
    render(<AIDiffFloatingActionButton />);
    fireEvent.click(screen.getByRole('button', {name: 'AI bot'}));
    expect(screen.getByText('AI Teaching Assistant')).to.be.visible;
  });
});
