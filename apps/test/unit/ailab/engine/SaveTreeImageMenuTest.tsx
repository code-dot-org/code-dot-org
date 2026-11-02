import {ToastProvider} from '@code-dot-org/component-library/toast';
import {act, fireEvent, render, screen} from '@testing-library/react';
import React, {createRef} from 'react';

import {
  captureTreeImage,
  downloadImage,
} from '@cdo/apps/ailab/engine/helpers/treeImage';
import SaveTreeImageMenu, {
  type SaveImageToBackpack,
} from '@cdo/apps/ailab/engine/UIComponents/SaveTreeImageMenu';

import {withTheme} from './renderWithProviders';

jest.mock('@cdo/apps/ailab/engine/helpers/treeImage', () => ({
  captureTreeImage: jest.fn(),
  downloadImage: jest.fn(),
}));

const mockCapture = jest.mocked(captureTreeImage);
const image = new Blob(['png'], {type: 'image/png'});

function renderMenu(saveToBackpack?: SaveImageToBackpack) {
  const treeRef = createRef<HTMLDivElement>();
  render(
    withTheme(
      <ToastProvider>
        <div ref={treeRef} />
        <SaveTreeImageMenu
          treeRef={treeRef}
          baseName="zoo-tree"
          saveToBackpack={saveToBackpack}
          tabbable
        />
      </ToastProvider>
    )
  );
  return treeRef;
}

const trigger = () => screen.getByRole('button', {name: 'Save image'});
const option = (name: string) => screen.queryByRole('button', {name});

async function choose(name: string) {
  fireEvent.click(trigger());
  await act(async () => {
    fireEvent.click(option(name)!);
  });
}

describe('SaveTreeImageMenu', () => {
  beforeEach(() => {
    mockCapture.mockResolvedValue(image);
  });

  it('downloads the tree as a PNG named for the dataset', async () => {
    const treeRef = renderMenu();

    await choose('Save to device');

    expect(mockCapture).toHaveBeenCalledWith(treeRef.current);
    expect(downloadImage).toHaveBeenCalledWith(image, 'zoo-tree.png');
  });

  it('offers the Backpack only when the host can save there', () => {
    renderMenu();
    expect(option('Save to Backpack')).toBeNull();
  });

  it('hands the image to the Backpack under the base name', async () => {
    const saveToBackpack = jest.fn().mockResolvedValue(undefined);
    renderMenu(saveToBackpack);

    await choose('Save to Backpack');

    expect(saveToBackpack).toHaveBeenCalledWith(image, 'zoo-tree');
  });

  it('holds off a second save until the first finishes', async () => {
    let finishCapture: (blob: Blob) => void = () => {};
    mockCapture.mockReturnValue(
      new Promise(resolve => {
        finishCapture = resolve;
      })
    );
    renderMenu();

    await choose('Save to device');
    expect(trigger()).toBeDisabled();

    await act(async () => finishCapture(image));
    expect(trigger()).toBeEnabled();
  });

  it('says so when the image cannot be made', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCapture.mockRejectedValue(new Error('decode failed'));
    renderMenu();

    await choose('Save to device');

    expect(
      screen.getByText("Couldn't save an image of your tree. Please try again.")
    ).toBeInTheDocument();
    expect(downloadImage).not.toHaveBeenCalled();
  });
});
