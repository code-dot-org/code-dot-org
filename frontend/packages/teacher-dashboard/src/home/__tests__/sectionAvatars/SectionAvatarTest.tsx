import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import SectionAvatar from '../../sectionAvatars/SectionAvatar';

describe('SectionAvatar', () => {
  const renderComponent = (color: number, emoji: number) => {
    render(<SectionAvatar color={color} emoji={emoji} size={'s'} />);
  };

  it('selects an avatar based on the seed number', () => {
    renderComponent(1, 1);
    screen.getByText('🐧');
  });

  it('selects a background color based on the seed number', () => {
    renderComponent(1, 1);
    expect(screen.getByRole('img')).toHaveStyle({
      backgroundColor: '#F62CAF',
    });
  });
});
