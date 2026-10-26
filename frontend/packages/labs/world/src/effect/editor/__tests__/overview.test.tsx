// The graph overview (React Flow's minimap), and the switch that shows it.
//
// It is off until it is asked for: a small picture of a graph you are already
// looking at, sitting in the corner a wire is most likely to be dragged toward.
// What matters is that the switch is findable — an overview nobody can turn on
// is an overview that does not exist — and that it says which way it is set.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';

const editor = () =>
  render(<EffectEditor initialDocument={createEffectDocument()} />).container;

const overview = (container: HTMLElement) =>
  container.querySelector('.react-flow__minimap');

describe('the graph overview', () => {
  it('is not shown until it is asked for', () => {
    const container = editor();
    expect(overview(container)).toBeNull();
    expect(
      screen.getByRole('button', {name: 'Show the graph overview'}),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('appears when the switch is pressed, and goes away again', () => {
    const container = editor();

    fireEvent.click(
      screen.getByRole('button', {name: 'Show the graph overview'}),
    );
    expect(overview(container)).not.toBeNull();

    const hide = screen.getByRole('button', {name: 'Hide the graph overview'});
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(hide);
    expect(overview(container)).toBeNull();
  });

  it('keeps its switch with the zoom buttons', () => {
    // It shows and hides React Flow's own chrome, so it belongs with the rest
    // of "how am I looking at this" rather than in the editor's toolbar.
    const container = editor();
    const controls = container.querySelector('.react-flow__controls')!;
    expect(
      controls.querySelector('button[aria-label="Show the graph overview"]'),
    ).not.toBeNull();
  });
});
