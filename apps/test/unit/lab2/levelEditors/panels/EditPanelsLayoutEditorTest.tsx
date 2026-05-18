import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditPanelsLayoutEditor from '@cdo/apps/lab2/levelEditors/panels/EditPanelsLayoutEditor';
import {Panel} from '@cdo/apps/panels/types';

jest.mock('@cdo/apps/localization', () => ({
  __esModule: true,
  default: {translate: (value: string) => value},
}));

const setEditorRect = (element: HTMLElement) => {
  element.getBoundingClientRect = jest.fn(
    () =>
      ({
        bottom: 360,
        height: 360,
        left: 0,
        right: 640,
        top: 0,
        width: 640,
      } as DOMRect)
  );
};

const firePointerEvent = (
  element: HTMLElement,
  type: string,
  options: {
    clientX: number;
    clientY: number;
    button?: number;
    pointerId?: number;
  }
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    button: options.button ?? 0,
    cancelable: true,
    clientX: options.clientX,
    clientY: options.clientY,
  });
  Object.defineProperty(event, 'pointerId', {value: options.pointerId ?? 1});
  fireEvent(element, event);
};

describe('EditPanelsLayoutEditor', () => {
  const panel: Panel = {
    key: 'panel-1',
    imageUrl: 'background.png',
    text: '',
    images: [{imageUrl: 'image.png', x: 25, y: 50, width: 30}],
    links: [{text: 'Panel text', x: 50, y: 50, targetKey: 'panel-2'}],
  };

  it('repositions an image by dragging it', () => {
    const updatePanel = jest.fn();
    render(<EditPanelsLayoutEditor panel={panel} updatePanel={updatePanel} />);
    const editor = screen.getByRole('region', {name: 'Panel layout editor'});
    setEditorRect(editor);

    firePointerEvent(
      screen.getByRole('button', {name: 'Image 1'}),
      'pointerdown',
      {
        button: 0,
        clientX: 160,
        clientY: 180,
        pointerId: 1,
      }
    );
    firePointerEvent(editor, 'pointermove', {
      clientX: 320,
      clientY: 90,
      pointerId: 1,
    });

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      images: [{imageUrl: 'image.png', x: 50, y: 25, width: 30}],
    });
  });

  it('resizes an image by dragging its resize handle', () => {
    const updatePanel = jest.fn();
    render(<EditPanelsLayoutEditor panel={panel} updatePanel={updatePanel} />);
    const editor = screen.getByRole('region', {name: 'Panel layout editor'});
    setEditorRect(editor);

    firePointerEvent(
      screen.getByRole('button', {name: 'Resize image 1'}),
      'pointerdown',
      {
        button: 0,
        clientX: 256,
        clientY: 270,
        pointerId: 1,
      }
    );
    firePointerEvent(editor, 'pointermove', {
      clientX: 352,
      clientY: 270,
      pointerId: 1,
    });

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      images: [{imageUrl: 'image.png', x: 25, y: 50, width: 60}],
    });
  });

  it('resizes an image with arrow keys on its resize handle', () => {
    const updatePanel = jest.fn();
    render(<EditPanelsLayoutEditor panel={panel} updatePanel={updatePanel} />);

    fireEvent.keyDown(screen.getByRole('button', {name: 'Resize image 1'}), {
      key: 'ArrowRight',
    });

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      images: [{imageUrl: 'image.png', x: 25, y: 50, width: 31}],
    });
  });

  it('repositions text by dragging it', () => {
    const updatePanel = jest.fn();
    render(<EditPanelsLayoutEditor panel={panel} updatePanel={updatePanel} />);
    const editor = screen.getByRole('region', {name: 'Panel layout editor'});
    setEditorRect(editor);

    firePointerEvent(
      screen.getByRole('button', {name: 'Text 1'}),
      'pointerdown',
      {
        button: 0,
        clientX: 320,
        clientY: 180,
        pointerId: 1,
      }
    );
    firePointerEvent(editor, 'pointermove', {
      clientX: 480,
      clientY: 270,
      pointerId: 1,
    });

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      links: [{text: 'Panel text', x: 75, y: 75, targetKey: 'panel-2'}],
    });
  });

  it('repositions a selected element with arrow keys', () => {
    const updatePanel = jest.fn();
    render(<EditPanelsLayoutEditor panel={panel} updatePanel={updatePanel} />);

    fireEvent.keyDown(screen.getByRole('button', {name: 'Text 1'}), {
      key: 'ArrowRight',
    });

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      links: [{text: 'Panel text', x: 51, y: 50, targetKey: 'panel-2'}],
    });
  });
});
