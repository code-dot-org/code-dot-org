import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import BackpackListControls from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/BackpackListControls';

const FILE_NAMES = ['index.html', 'style.css', 'app.js', 'logo.png'];

const renderControls = (props = {}) =>
  render(
    <BackpackListControls
      fileNames={FILE_NAMES}
      selectedCategoryId="all"
      onCategoryChange={jest.fn()}
      sortOrder="name-asc"
      onSortOrderChange={jest.fn()}
      {...props}
    />
  );

describe('BackpackListControls', () => {
  it('offers only the categories the backpack holds, with counts', () => {
    renderControls();

    // The trigger repeats the selected option's label, so match option buttons by name.
    const option = (name: string) => screen.getByRole('button', {name});
    expect(option('All (4)')).toBeDefined();
    expect(option('Images (1)')).toBeDefined();
    expect(option('HTML (1)')).toBeDefined();
    expect(option('CSS (1)')).toBeDefined();
    expect(option('Javascript (1)')).toBeDefined();
    expect(screen.queryByRole('button', {name: /^Python/})).toBeNull();
  });

  it('reports the picked category and sort order', async () => {
    const user = userEvent.setup();
    const onCategoryChange = jest.fn();
    const onSortOrderChange = jest.fn();
    renderControls({onCategoryChange, onSortOrderChange});

    await user.click(screen.getByText('HTML (1)'));
    expect(onCategoryChange).toHaveBeenCalledWith('html');

    await user.click(screen.getByText('Alphabetical (Z-A)'));
    expect(onSortOrderChange).toHaveBeenCalledWith('name-desc');
  });

  // Guards the closeOpenDropdownMenu workaround in BackpackListControls.
  it('closes the menu after a pick', async () => {
    const user = userEvent.setup();
    renderControls();
    const dropdown = document.getElementById(
      'backpack-file-type-filter-dropdown'
    );

    await user.click(screen.getByRole('button', {name: /^File type:/}));
    expect(dropdown?.className).toMatch(/open/);

    await user.click(screen.getByText('HTML (1)'));
    expect(dropdown?.className).not.toMatch(/open/);
  });
});
