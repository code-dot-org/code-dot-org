import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditPanelsImages from '@cdo/apps/lab2/levelEditors/panels/EditPanelsImages';
import {
  DEFAULT_PANEL_IMAGE_WIDTH,
  DEFAULT_PANEL_IMAGE_X,
  DEFAULT_PANEL_IMAGE_Y,
  Panel,
} from '@cdo/apps/panels/types';

jest.mock('@cdo/apps/levelbuilder/ImageInput', () => {
  const React = require('react');
  const ImageInput = ({
    initialImageUrl,
    updateImageUrl,
  }: {
    initialImageUrl?: string;
    updateImageUrl: (imageUrl: string) => void;
  }) =>
    React.createElement('input', {
      'aria-label': 'Image URL',
      value: initialImageUrl || '',
      onChange: (event: {target: HTMLInputElement}) =>
        updateImageUrl(event.target.value),
    });
  return {__esModule: true, default: ImageInput};
});

const createDataTransfer = () => {
  const data: {[key: string]: string} = {};
  return {
    dropEffect: '',
    effectAllowed: '',
    getData: (key: string) => data[key] || '',
    setData: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

describe('EditPanelsImages', () => {
  const panel: Panel = {
    key: 'panel-1',
    imageUrl: 'background.png',
    text: '',
  };

  it('adds an image with default position and scale', () => {
    const updatePanel = jest.fn();
    render(<EditPanelsImages panel={panel} updatePanel={updatePanel} />);

    fireEvent.click(screen.getByRole('button', {name: /Add Image/}));

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      images: [
        {
          imageUrl: '',
          x: DEFAULT_PANEL_IMAGE_X,
          y: DEFAULT_PANEL_IMAGE_Y,
          width: DEFAULT_PANEL_IMAGE_WIDTH,
        },
      ],
    });
  });

  it('updates an image url, position, and scale', () => {
    const updatePanel = jest.fn();
    const panelWithImage: Panel = {
      ...panel,
      images: [{imageUrl: 'old.png', x: 10, y: 20, width: 30}],
    };
    render(
      <EditPanelsImages panel={panelWithImage} updatePanel={updatePanel} />
    );

    fireEvent.change(screen.getByLabelText('Image URL'), {
      target: {value: 'new.png'},
    });
    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithImage,
      images: [{imageUrl: 'new.png', x: 10, y: 20, width: 30}],
    });

    fireEvent.change(screen.getByLabelText('Alt text'), {
      target: {value: 'description'},
    });
    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithImage,
      images: [
        {imageUrl: 'old.png', altText: 'description', x: 10, y: 20, width: 30},
      ],
    });

    fireEvent.change(screen.getByLabelText('X: 10%'), {
      target: {value: '45'},
    });
    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithImage,
      images: [{imageUrl: 'old.png', x: 45, y: 20, width: 30}],
    });

    fireEvent.change(screen.getByLabelText('Y: 20%'), {
      target: {value: '55'},
    });
    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithImage,
      images: [{imageUrl: 'old.png', x: 10, y: 55, width: 30}],
    });

    fireEvent.change(screen.getByLabelText('Scale: 30%'), {
      target: {value: '65'},
    });
    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithImage,
      images: [{imageUrl: 'old.png', x: 10, y: 20, width: 65}],
    });
  });

  it('removes the images property after deleting the last image', () => {
    const updatePanel = jest.fn();
    const panelWithImage: Panel = {
      ...panel,
      images: [{imageUrl: 'old.png', x: 10, y: 20, width: 30}],
    };
    render(
      <EditPanelsImages panel={panelWithImage} updatePanel={updatePanel} />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Delete image'}));

    expect(updatePanel).toHaveBeenCalledWith({
      ...panelWithImage,
      images: undefined,
    });
  });

  it('reorders images by dragging the handle', () => {
    const updatePanel = jest.fn();
    const firstImage = {imageUrl: 'first.png', x: 10, y: 20, width: 30};
    const secondImage = {imageUrl: 'second.png', x: 40, y: 50, width: 60};
    const panelWithImages: Panel = {
      ...panel,
      images: [firstImage, secondImage],
    };
    render(
      <EditPanelsImages panel={panelWithImages} updatePanel={updatePanel} />
    );

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(
      screen.getByRole('button', {name: 'Drag image 1 to reorder'}),
      {dataTransfer}
    );
    fireEvent.dragOver(screen.getByRole('group', {name: 'Image 2 settings'}), {
      dataTransfer,
    });
    fireEvent.drop(screen.getByRole('group', {name: 'Image 2 settings'}), {
      dataTransfer,
    });

    expect(updatePanel).toHaveBeenCalledWith({
      ...panelWithImages,
      images: [secondImage, firstImage],
    });
  });

  it('reorders images with arrow keys on the handle', () => {
    const updatePanel = jest.fn();
    const firstImage = {imageUrl: 'first.png', x: 10, y: 20, width: 30};
    const secondImage = {imageUrl: 'second.png', x: 40, y: 50, width: 60};
    const panelWithImages: Panel = {
      ...panel,
      images: [firstImage, secondImage],
    };
    render(
      <EditPanelsImages panel={panelWithImages} updatePanel={updatePanel} />
    );

    fireEvent.keyDown(
      screen.getByRole('button', {name: 'Drag image 2 to reorder'}),
      {key: 'ArrowUp'}
    );

    expect(updatePanel).toHaveBeenCalledWith({
      ...panelWithImages,
      images: [secondImage, firstImage],
    });
  });
});
