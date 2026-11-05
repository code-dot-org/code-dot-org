// The layer strip says what it hides (mapEditor/LayerPanel).

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {LayerPanel} from '../LayerPanel';
import type {MapLayerDoc} from '../mapModel';

// Back to front, as the document holds them.
const LAYERS: MapLayerDoc[] = [
  {id: 'sky', name: 'Sky'},
  {id: 'main'},
  {id: 'trees', name: 'Trees'},
  {id: 'mist', name: 'Mist'},
];

const renderPanel = (showAll = false) => {
  const props = {
    layers: LAYERS,
    selected: 'main',
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onMove: vi.fn(),
    showAll,
    onShowAll: vi.fn(),
    isReadOnly: false,
  };
  render(<LayerPanel {...props} />);
  return props;
};

describe('the layer strip', () => {
  it('says how many layers in front a press hides, and how to get them back', () => {
    const props = renderPanel();
    fireEvent.click(screen.getByRole('button', {name: 'Sky'}));
    expect(props.onSelect).toHaveBeenCalledWith('sky');
    expect(screen.getByRole('status')).toHaveTextContent(
      '3 layers in front of Sky hidden; Show all layers brings them back',
    );
    fireEvent.click(screen.getByRole('button', {name: 'Trees'}));
    expect(screen.getByRole('status')).toHaveTextContent(
      '1 layer in front of Trees hidden; Show all layers brings it back',
    );
    fireEvent.click(screen.getByRole('button', {name: 'Mist'}));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('counts what Show all layers brings back, and says when it does', () => {
    const props = renderPanel();
    const box = screen.getByRole('checkbox', {
      name: 'Show all layers (2 layers hidden)',
    });
    fireEvent.click(box);
    expect(props.onShowAll).toHaveBeenCalledWith(true);
    expect(screen.getByRole('status')).toHaveTextContent('2 layers shown');
  });

  it('hides nothing on a press while all are shown', () => {
    renderPanel(true);
    expect(
      screen.getByRole('checkbox', {name: 'Show all layers'}),
    ).toBeChecked();
    fireEvent.click(screen.getByRole('button', {name: 'Sky'}));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
