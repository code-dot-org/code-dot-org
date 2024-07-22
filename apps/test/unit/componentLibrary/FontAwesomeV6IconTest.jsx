import {render, screen} from '@testing-library/react';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

describe('Design System - FontAwesomeV6Icon', () => {
  it('FontAwesomeV6Icon - renders with correct classNames and title', () => {
    render(
      <FontAwesomeV6Icon
        iconStyle="solid"
        iconName="check"
        title="check-icon"
        className="test-class"
      />
    );

    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toBeDefined();
    expect(icon.classList.contains('fa-solid')).toBe(true);
    expect(icon.classList.contains('fa-check')).toBe(true);
    expect(icon.classList.contains('test-class')).toBe(true);
    expect(icon.getAttribute('title')).toBe('check-icon');
  });
});
