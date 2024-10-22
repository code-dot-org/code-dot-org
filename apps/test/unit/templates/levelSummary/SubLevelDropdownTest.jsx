import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import SubLevelDropdown from '@cdo/apps/templates/levelSummary/SubLevelDropdown';
import i18n from '@cdo/locale';

describe('SubLevelDropdown', () => {
  const subLevels = [{id: 1}, {id: 2}, {id: 3}];

  test('renders dropdown with correct options', () => {
    const handleChange = () => {};

    render(
      <SubLevelDropdown subLevels={subLevels} handleChange={handleChange} />
    );

    // Check that the dropdown options are rendered correctly
    subLevels.forEach((_, index) => {
      expect(
        screen.getByText(`${i18n.question()}: ${index + 1}`)
      ).toBeInTheDocument();
    });
  });

  test('calls handleChange when dropdown value changes', () => {
    let selectedValue = 'null';
    const handleChange = event => {
      selectedValue = event.target.value;
    };

    render(
      <SubLevelDropdown subLevels={subLevels} handleChange={handleChange} />
    );

    // Simulate changing the dropdown value
    fireEvent.change(screen.getByRole('combobox'), {target: {value: '1'}});

    // Check that handleChange is called with the correct value
    expect(selectedValue).toBe('1');
  });
});
