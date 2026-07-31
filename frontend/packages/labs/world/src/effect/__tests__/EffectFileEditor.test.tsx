// The join between Codebridge's text-file world and the editor's document
// world: parse on open, serialize on change, and say so when the file is
// broken rather than replacing it.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {EffectFileEditor} from '../EffectFileEditor';
import {serializeEffectDocument} from '../model';
import {rippleEffect} from '../stock';

const props = (overrides: Partial<Parameters<typeof EffectFileEditor>[0]>) => ({
  fileId: 'ripple',
  language: 'effect',
  initialContents: '',
  isReadOnly: false,
  onChange: vi.fn(),
  ...overrides,
});

describe('EffectFileEditor', () => {
  it('opens a stored effect by name', () => {
    render(
      <EffectFileEditor
        {...props({initialContents: serializeEffectDocument(rippleEffect)})}
      />,
    );

    expect(screen.getByLabelText('Effect name')).toHaveValue('Ripple');
  });

  it('treats an empty file as a new effect, not a broken one', () => {
    // Codebridge creates a new file with no contents at all.
    render(<EffectFileEditor {...props({initialContents: ''})} />);

    expect(screen.getByLabelText('Effect name')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reports a file it cannot parse, and shows what is in it', () => {
    // Not replaced with a blank effect: overwriting what the learner has is
    // worse than refusing to open it.
    render(<EffectFileEditor {...props({initialContents: '{"nope": true'})} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('not valid JSON');
    expect(alert).toHaveTextContent('{"nope": true');
  });

  it('does not write the file back merely for opening it', () => {
    // A serialize-on-mount would dirty the project and churn stored text for a
    // document identical to the one on disk.
    const onChange = vi.fn();
    render(
      <EffectFileEditor
        {...props({
          initialContents: serializeEffectDocument(rippleEffect),
          onChange,
        })}
      />,
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('serializes an edit back to file text', () => {
    const onChange = vi.fn();
    render(
      <EffectFileEditor
        {...props({
          initialContents: serializeEffectDocument(rippleEffect),
          onChange,
        })}
      />,
    );

    fireEvent.change(screen.getByLabelText('Effect description'), {
      target: {value: 'Wavy'},
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const written = onChange.mock.calls[0][0] as string;
    expect(JSON.parse(written).description).toBe('Wavy');
  });

  it('passes a read-only workspace through to the editor', () => {
    render(
      <EffectFileEditor
        {...props({
          initialContents: serializeEffectDocument(rippleEffect),
          isReadOnly: true,
        })}
      />,
    );

    expect(screen.getByLabelText('Effect name')).toBeDisabled();
  });
});
