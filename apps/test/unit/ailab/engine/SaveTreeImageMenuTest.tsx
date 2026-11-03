import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ToastProvider} from '@code-dot-org/component-library/toast';
import {act, fireEvent, render, screen} from '@testing-library/react';
import React, {createRef} from 'react';

import {captureTreeImage} from '@cdo/apps/ailab/engine/helpers/treeImage';
import SaveTreeImageMenu, {
  type SaveImageToBackpack,
} from '@cdo/apps/ailab/engine/UIComponents/SaveTreeImageMenu';
import {downloadBlobAsPng} from '@cdo/apps/imageUtils';

import {withTheme} from './renderWithProviders';

jest.mock('@cdo/apps/ailab/engine/helpers/treeImage', () => ({
  captureTreeImage: jest.fn(),
}));
jest.mock('@cdo/apps/imageUtils', () => ({downloadBlobAsPng: jest.fn()}));

const mockCapture = jest.mocked(captureTreeImage);
const image = new Blob(['png'], {type: 'image/png'});

function renderMenu(saveToBackpack?: SaveImageToBackpack) {
  const treeRef = createRef<HTMLDivElement>();
  render(
    withTheme(
      <ToastProvider>
        <div ref={treeRef} role="tree" aria-label="Decision tree" />
        <ActionDropdown
          name="other"
          labelText="Other menu"
          options={[
            {
              value: 'other',
              label: 'Other option',
              icon: {iconName: 'check'},
              onClick: () => {},
            },
          ]}
          triggerButtonProps={{}}
        />
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
const isOpen = () => trigger().hasAttribute('data-force-hover');

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
  afterEach(() => jest.restoreAllMocks());

  it('downloads the tree as a PNG named for the dataset', async () => {
    const treeRef = renderMenu();

    await choose('Save to device');

    expect(mockCapture).toHaveBeenCalledWith(treeRef.current);
    expect(downloadBlobAsPng).toHaveBeenCalledWith(image, 'zoo-tree.png');
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

  it('closes the menu and returns focus to its button after a choice', async () => {
    renderMenu();

    await choose('Save to device');

    expect(isOpen()).toBe(false);
    expect(trigger()).toHaveFocus();
  });

  it('closes when the tree is pressed', () => {
    renderMenu();
    fireEvent.click(trigger());

    fireEvent.pointerDown(screen.getByRole('tree'));

    expect(isOpen()).toBe(false);
  });

  it('leaves other dropdowns open', () => {
    renderMenu();
    const otherTrigger = screen.getByRole('button', {name: 'Other menu'});
    fireEvent.click(otherTrigger);

    fireEvent.pointerDown(option('Other option')!);

    expect(otherTrigger).toHaveAttribute('data-force-hover');
  });

  it('says so when the image cannot be made', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCapture.mockRejectedValue(new Error('decode failed'));
    renderMenu();

    await choose('Save to device');

    expect(
      screen.getByText("Couldn't save an image of your tree. Please try again.")
    ).toBeInTheDocument();
    expect(downloadBlobAsPng).not.toHaveBeenCalled();
  });
});
