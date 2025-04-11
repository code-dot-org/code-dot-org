import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import SectionAvatar from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionAvatar';

describe('SectionAvatar', () => {
  const renderComponent = (color: number, emoji: number) => {
    render(<SectionAvatar color={color} emoji={emoji} />);
  };

  it('selects an avatar based on the seed number', () => {
    renderComponent(1, 1);
    screen.getByText('🐧');
  });

  it('selects a background color based on the seed number', () => {
    renderComponent(1, 1);
    expect(document.firstElementChild).toHaveStyle(
      "background-color: '#F62CAF'"
    );
  });
});
