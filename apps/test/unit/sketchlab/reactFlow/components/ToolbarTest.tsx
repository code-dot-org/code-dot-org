import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Toolbar from '@cdo/apps/sketchlab/reactFlow/components/Toolbar';

// The hidden file input can't be driven from a test, so stand in for it and
// assert on whether the toolbar asked to open it.
const mockOpenFileInput = jest.fn();
jest.mock('@cdo/apps/util/hooks/useHiddenFileInput', () => ({
  __esModule: true,
  default: () => [mockOpenFileInput, () => null],
}));

describe('Toolbar', () => {
  const defaultProps = {
    onAddNode: jest.fn(),
    uploadImage: jest.fn(),
    onImageUploadError: jest.fn(),
    canvasTool: 'cursor' as const,
    onSetCanvasTool: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the file picker when uploads are enabled', async () => {
    const openUploadsDisabledModal = jest.fn();
    render(
      <Toolbar
        {...defaultProps}
        openUploadsDisabledModal={openUploadsDisabledModal}
      />
    );

    await userEvent.click(screen.getByRole('button', {name: 'Add image'}));

    expect(mockOpenFileInput).toHaveBeenCalledTimes(1);
    expect(openUploadsDisabledModal).not.toHaveBeenCalled();
  });

  it('explains that uploads are disabled instead of asking for a file', async () => {
    const openUploadsDisabledModal = jest.fn();
    render(
      <Toolbar
        {...defaultProps}
        uploadsDisabled
        openUploadsDisabledModal={openUploadsDisabledModal}
      />
    );

    await userEvent.click(screen.getByRole('button', {name: 'Add image'}));

    expect(openUploadsDisabledModal).toHaveBeenCalledTimes(1);
    expect(mockOpenFileInput).not.toHaveBeenCalled();
  });

  it('omits the image tool entirely when image upload is not allowed', () => {
    render(<Toolbar {...defaultProps} allowImageUpload={false} />);

    expect(
      screen.queryByRole('button', {name: 'Add image'})
    ).not.toBeInTheDocument();
  });
});
