import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {getPopulatedFileTypeConfigs} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/backpackFileFilters';
import BackpackListControls from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/BackpackListControls';

const FILE_NAMES = ['index.html', 'style.css', 'app.js', 'logo.png'];
const SUPPORTED_FILE_TYPES = ['html', 'css', 'js', 'png'];

const renderControls = (props = {}) =>
  render(
    <BackpackListControls
      fileNames={FILE_NAMES}
      selectedExtension="all"
      onExtensionChange={jest.fn()}
      sortOrder="name-asc"
      onSortOrderChange={jest.fn()}
      populatedFileTypeConfigs={getPopulatedFileTypeConfigs(
        FILE_NAMES,
        SUPPORTED_FILE_TYPES
      )}
      {...props}
    />
  );

describe('BackpackListControls', () => {
  it('offers only the file types the backpack holds, with counts', () => {
    renderControls();

    // The trigger repeats the selected option's label, so match option buttons by name.
    const option = (name: string) => screen.getByRole('button', {name});
    expect(option('All (4)')).toBeDefined();
    expect(option('PNG (1)')).toBeDefined();
    expect(option('HTML (1)')).toBeDefined();
    expect(option('CSS (1)')).toBeDefined();
    expect(option('JavaScript (1)')).toBeDefined();
    expect(screen.queryByRole('button', {name: /^Python/})).toBeNull();
  });

  it('reports the picked file type and sort order', async () => {
    const user = userEvent.setup();
    const onExtensionChange = jest.fn();
    const onSortOrderChange = jest.fn();
    renderControls({onExtensionChange, onSortOrderChange});

    await user.click(screen.getByText('HTML (1)'));
    expect(onExtensionChange).toHaveBeenCalledWith('html');

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

  it('returns focus to the trigger after a pick', async () => {
    const user = userEvent.setup();
    renderControls();

    await user.click(screen.getByRole('button', {name: /^File type:/}));
    await user.click(screen.getByText('HTML (1)'));

    expect(document.activeElement).toBe(
      document.getElementById('backpack-file-type-filter-dropdown-button')
    );
  });
});
