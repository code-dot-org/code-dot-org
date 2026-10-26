import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {createEffectDocument} from '../../model/document';
import type {EffectDocument} from '../../model/types';
import {EffectEditor} from '../EffectEditor';
import {NodeNote} from '../NodeNote';

/** The document from the most recent onChange call. */
function lastDocument(onChange: ReturnType<typeof vi.fn>): EffectDocument {
  return onChange.mock.calls.at(-1)?.[0] as EffectDocument;
}

/**
 * The canvas itself is exercised in the playground, not here: React Flow needs
 * real layout measurement and WebGL previews need a real GL context, neither of
 * which jsdom provides. These tests cover the parts that hold up without them.
 */
describe('EffectEditor', () => {
  it('renders the fixed input and output rows', () => {
    render(<EffectEditor initialDocument={createEffectDocument()} />);

    expect(screen.getByLabelText('Effect input')).toBeInTheDocument();
    expect(screen.getByLabelText('Effect output')).toBeInTheDocument();
  });

  it('offers the stock nodes in the palette', () => {
    render(<EffectEditor initialDocument={createEffectDocument()} />);

    expect(screen.getByRole('button', {name: 'Multiply'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Sample'})).toBeInTheDocument();
  });

  it('shows a compile error rather than an empty preview', () => {
    const empty = {...createEffectDocument(), edges: []};

    render(<EffectEditor initialDocument={empty} />);

    expect(
      screen.getByText('Nothing is connected to the Output yet.'),
    ).toBeInTheDocument();
  });

  describe('code view', () => {
    it('toggles the live GLSL panel from the toolbar', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);

      expect(screen.queryByText(/gl_FragColor/)).not.toBeInTheDocument();

      const toggle = screen.getByRole('button', {name: 'Show the GLSL code'});
      fireEvent.click(toggle);

      expect(screen.getByText(/gl_FragColor/)).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(toggle);
      expect(screen.queryByText(/gl_FragColor/)).not.toBeInTheDocument();
    });

    it('opens on the effect itself, with the setup lines folded away', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);
      fireEvent.click(screen.getByRole('button', {name: 'Show the GLSL code'}));

      // What this graph became is on screen; what is true of every shader is
      // behind a toggle that names how much it is hiding.
      expect(
        screen.getByText(/uniform sampler2D uMainSampler/),
      ).toBeInTheDocument();
      expect(screen.queryByText(/#version 100/)).not.toBeInTheDocument();

      const setup = screen.getByRole('button', {
        name: 'Show the 7 setup lines',
      });
      expect(setup).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(setup);

      expect(screen.getByText(/#version 100/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Hide the 7 setup lines'}),
      ).toHaveAttribute('aria-expanded', 'true');
    });

    it('offers nothing to unfold when the graph will not compile', () => {
      render(
        <EffectEditor
          initialDocument={{...createEffectDocument(), edges: []}}
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Show the GLSL code'}));

      expect(
        screen.queryByRole('button', {name: /setup lines/}),
      ).not.toBeInTheDocument();
    });

    it('shows the compile error as a comment when the graph is broken', () => {
      const empty = {...createEffectDocument(), edges: []};
      render(<EffectEditor initialDocument={empty} />);

      fireEvent.click(screen.getByRole('button', {name: 'Show the GLSL code'}));

      expect(
        screen.getByText('// Nothing is connected to the Output yet.'),
      ).toBeInTheDocument();
    });
  });

  describe('compile-error highlighting', () => {
    it('puts the error message on the node the compiler blamed', () => {
      const document = createEffectDocument();
      // Sample without its texture wire: the error names sample-1/texture.
      const broken = {
        ...document,
        edges: document.edges.filter(edge => edge.target.port !== 'texture'),
      };

      render(<EffectEditor initialDocument={broken} />);

      const node = screen.getByTestId('effect-node-sample-1');
      expect(
        within(node).getByText('"Texture" needs a texture wired into it.'),
      ).toBeInTheDocument();
      expect(node.className).toMatch(/errored/);
    });

    it('marks no node when the effect compiles', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);

      expect(screen.getByTestId('effect-node-sample-1').className).not.toMatch(
        /errored/,
      );
      expect(screen.queryByText(/needs a texture/)).not.toBeInTheDocument();
    });
  });

  describe('parameter editing', () => {
    it('adds a parameter and opens its editor ready for renaming', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Name'), {
        target: {value: 'waviness'},
      });

      const [parameter] = lastDocument(onChange).parameters;
      expect(parameter.name).toBe('waviness');
      expect(parameter.id).toBe('param1');
    });

    it('does not commit an empty name', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));
      fireEvent.change(screen.getByLabelText('Name'), {target: {value: '  '}});

      // The name is the `.addEffect()` argument; blank would be an unusable
      // block, so the document keeps the last real name.
      expect(lastDocument(onChange).parameters[0].name).toBe('param1');
    });

    it('changing the type resets the default to the new shape', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));
      fireEvent.change(screen.getByLabelText('Type'), {
        target: {value: 'vec3'},
      });

      const [parameter] = lastDocument(onChange).parameters;
      expect(parameter.type).toBe('vec3');
      expect(parameter.defaultValue).toEqual([0, 0, 0]);
      expect(parameter.min).toBeUndefined();
    });

    it('reopens from the knob and removes the parameter', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', {name: 'Edit parameter param1'}),
      );
      fireEvent.click(screen.getByRole('button', {name: 'Remove parameter'}));

      expect(lastDocument(onChange).parameters).toHaveLength(0);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('reuses no ids after a delete', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      // Add two, remove the first, add again: the new one must not collide
      // with the surviving param2.
      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      fireEvent.click(
        screen.getByRole('button', {name: 'Edit parameter param1'}),
      );
      fireEvent.click(screen.getByRole('button', {name: 'Remove parameter'}));
      fireEvent.click(screen.getByRole('button', {name: 'Parameter'}));

      const ids = lastDocument(onChange).parameters.map(
        parameter => parameter.id,
      );
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toEqual(['param2', 'param1']);
    });
  });

  describe('functions', () => {
    it('creates a function and opens its workspace', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'New function'}));

      // The function bar is up, the row offers "+ Input", and the test
      // texture column is gone — this is a function workspace, not the effect.
      expect(screen.getByLabelText('Function name')).toHaveValue('Function 1');
      expect(screen.getByRole('button', {name: 'Input'})).toBeInTheDocument();
      expect(
        screen.queryByLabelText('Change test texture'),
      ).not.toBeInTheDocument();
      expect(lastDocument(onChange).functions).toHaveLength(1);
    });

    it('returns to the effect and lists the function in the palette', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);

      fireEvent.click(screen.getByRole('button', {name: 'New function'}));
      fireEvent.click(screen.getByRole('button', {name: 'Effect'}));

      expect(screen.queryByLabelText('Function name')).not.toBeInTheDocument();
      expect(screen.getByText('Your Functions')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Function 1'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Open function Function 1'}),
      ).toBeInTheDocument();
    });

    it('deleting a function also removes the nodes that used it', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'New function'}));
      fireEvent.click(screen.getByRole('button', {name: 'Effect'}));
      // Place a call node, then delete the function from inside it.
      fireEvent.click(screen.getByRole('button', {name: 'Function 1'}));
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'fn:fn1'),
      ).toBe(true);

      fireEvent.click(
        screen.getByRole('button', {name: 'Open function Function 1'}),
      );
      fireEvent.click(screen.getByRole('button', {name: 'Delete function'}));

      const document = lastDocument(onChange);
      expect(document.functions).toHaveLength(0);
      expect(document.nodes.some(node => node.type === 'fn:fn1')).toBe(false);
      // Back in the main workspace after the delete.
      expect(screen.queryByLabelText('Function name')).not.toBeInTheDocument();
    });

    it('undoing function creation drops the editor back to the effect', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);

      fireEvent.click(screen.getByRole('button', {name: 'New function'}));
      fireEvent.keyDown(window, {key: 'z', ctrlKey: true});

      expect(screen.queryByLabelText('Function name')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Change test texture')).toBeInTheDocument();
    });
  });

  describe('effect name and description', () => {
    it('renames the effect from the header bar', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument('Ripple')}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByLabelText('Effect name'), {
        target: {value: 'Underwater'},
      });

      expect(lastDocument(onChange).name).toBe('Underwater');
    });

    it('does not commit an empty name', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument('Ripple')}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByLabelText('Effect name'), {
        target: {value: '   '},
      });

      // A nameless effect is an unlabelled entry in whatever list shows it.
      expect(lastDocument(onChange)?.name ?? 'Ripple').toBe('Ripple');
    });

    it('writes a description, and clears it back to absent', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument('Ripple')}
          onChange={onChange}
        />,
      );

      const field = screen.getByLabelText('Effect description');
      fireEvent.change(field, {target: {value: 'Waves the picture sideways.'}});
      expect(lastDocument(onChange).description).toBe(
        'Waves the picture sideways.',
      );

      // Emptied means absent, not an empty string in the file.
      fireEvent.change(field, {target: {value: ''}});
      expect(lastDocument(onChange)).not.toHaveProperty('description');
    });

    it('gives way to the function bar inside a function', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);

      expect(screen.getByLabelText('Effect name')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'New function'}));

      // One slot, two bars: the effect's identity is not what you are editing
      // while you are inside a function.
      expect(screen.queryByLabelText('Effect name')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Function name')).toBeInTheDocument();
    });
  });

  describe('node notes', () => {
    /** Select a node the way the canvas would, so its note slot appears. */
    const renderSelected = (note?: string) => {
      const document = createEffectDocument();
      const onChange = vi.fn();
      const withNote = {
        ...document,
        nodes: document.nodes.map(node =>
          node.id === 'sample-1' ? {...node, note} : node,
        ),
      };
      render(<EffectEditor initialDocument={withNote} onChange={onChange} />);
      return {onChange};
    };

    it('offers no note controls until the node is selected', () => {
      renderSelected('Reads the picture.');

      // Nothing is selected on first render, so the annotation stays out of
      // the way — that gating is the whole point of putting it on selection.
      expect(screen.queryByText('Reads the picture.')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Add a note to Sample'),
      ).not.toBeInTheDocument();
    });

    it('does not touch the document until editing finishes', () => {
      // A note is part of the compiled shader, so a write per keystroke would
      // recompile and relink a WebGL program per open preview on every
      // character. Typing has to stay local to the field.
      const document = createEffectDocument();
      const onChange = vi.fn();
      render(
        <NodeNote
          note={undefined}
          nodeLabel="Sample"
          onChange={value => onChange(value)}
        />,
      );

      fireEvent.click(screen.getByLabelText('Add a note to Sample'));
      const field = screen.getByLabelText('Note about Sample');
      fireEvent.change(field, {target: {value: 'Reads'}});
      fireEvent.change(field, {target: {value: 'Reads the'}});
      fireEvent.change(field, {target: {value: 'Reads the picture.'}});

      expect(onChange).not.toHaveBeenCalled();

      fireEvent.blur(field);

      // One document change, carrying the whole note.
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('Reads the picture.');
      void document;
    });

    it('writes nothing when a new note is abandoned empty', () => {
      const onChange = vi.fn();
      render(
        <NodeNote note={undefined} nodeLabel="Sample" onChange={onChange} />,
      );

      fireEvent.click(screen.getByLabelText('Add a note to Sample'));
      fireEvent.blur(screen.getByLabelText('Note about Sample'));

      // Nothing was ever written, so there is no empty note and no undo entry.
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByLabelText('Add a note to Sample')).toBeInTheDocument();
    });

    it('clearing the text deletes the note', () => {
      const onChange = vi.fn();
      render(
        <NodeNote
          note="Reads the picture."
          nodeLabel="Sample"
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByLabelText('Edit the note about Sample'));
      const field = screen.getByLabelText('Note about Sample');
      fireEvent.change(field, {target: {value: '   '}});
      fireEvent.blur(field);

      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('is not an edit when the text comes back unchanged', () => {
      const onChange = vi.fn();
      render(
        <NodeNote
          note="Reads the picture."
          nodeLabel="Sample"
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByLabelText('Edit the note about Sample'));
      fireEvent.blur(screen.getByLabelText('Note about Sample'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('color picker nodes', () => {
    it('writes a picked color to every channel in one undo step', () => {
      const document = createEffectDocument();
      const withColor = {
        ...document,
        nodes: [
          ...document.nodes,
          {id: 'colorRgba-1', type: 'colorRgba', position: {x: 0, y: 0}},
        ],
      };
      const onChange = vi.fn();
      render(<EffectEditor initialDocument={withColor} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText('Pick a color'), {
        target: {value: '#ff0080'},
      });

      const picked = lastDocument(onChange).nodes.find(
        node => node.id === 'colorRgba-1',
      );
      expect(picked?.params).toMatchObject({r: 1, g: 0, b: 0.502});

      // One Ctrl+Z clears the whole pick — three channels, one step.
      fireEvent.keyDown(window, {key: 'z', ctrlKey: true});
      const undone = lastDocument(onChange).nodes.find(
        node => node.id === 'colorRgba-1',
      );
      expect(undone?.params ?? {}).toEqual({});
    });

    it('throttles a picker drag but always lands the last color', () => {
      vi.useFakeTimers();
      try {
        const document = createEffectDocument();
        const withColor = {
          ...document,
          nodes: [
            ...document.nodes,
            {id: 'colorRgba-1', type: 'colorRgba', position: {x: 0, y: 0}},
          ],
        };
        const onChange = vi.fn();
        render(
          <EffectEditor initialDocument={withColor} onChange={onChange} />,
        );
        const swatch = screen.getByLabelText('Pick a color');
        const updatesBefore = onChange.mock.calls.length;

        // A drag streams events; only the first commits immediately.
        for (const hex of ['#100000', '#200000', '#300000', '#400000']) {
          fireEvent.change(swatch, {target: {value: hex}});
        }
        expect(onChange.mock.calls.length).toBe(updatesBefore + 1);
        expect(
          lastDocument(onChange).nodes.find(node => node.id === 'colorRgba-1')
            ?.params?.r,
        ).toBeCloseTo(0.063, 3);

        // The trailing edge lands the final color even with no more events.
        act(() => {
          vi.advanceTimersByTime(150);
        });
        expect(onChange.mock.calls.length).toBe(updatesBefore + 2);
        expect(
          lastDocument(onChange).nodes.find(node => node.id === 'colorRgba-1')
            ?.params?.r,
        ).toBeCloseTo(0.251, 3);
      } finally {
        vi.useRealTimers();
      }
    });

    it('converts a pick to HSLA channels on the HSLA node', () => {
      const document = createEffectDocument();
      const withColor = {
        ...document,
        nodes: [
          ...document.nodes,
          {id: 'colorHsla-1', type: 'colorHsla', position: {x: 0, y: 0}},
        ],
      };
      const onChange = vi.fn();
      render(<EffectEditor initialDocument={withColor} onChange={onChange} />);

      // Pure green: hue 120, full saturation, half lightness.
      fireEvent.change(screen.getByLabelText('Pick a color'), {
        target: {value: '#00ff00'},
      });

      const picked = lastDocument(onChange).nodes.find(
        node => node.id === 'colorHsla-1',
      );
      expect(picked?.params).toMatchObject({h: 120, s: 1, l: 0.5});
    });
  });

  describe('undo and redo', () => {
    it('disables both buttons before any edit is made', () => {
      render(<EffectEditor initialDocument={createEffectDocument()} />);

      expect(screen.getByRole('button', {name: 'Undo'})).toBeDisabled();
      expect(screen.getByRole('button', {name: 'Redo'})).toBeDisabled();
    });

    it('undoes an edit from the button and redoes it back', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Sine'}));
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'sine'),
      ).toBe(true);

      fireEvent.click(screen.getByRole('button', {name: 'Undo'}));
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'sine'),
      ).toBe(false);

      fireEvent.click(screen.getByRole('button', {name: 'Redo'}));
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'sine'),
      ).toBe(true);
    });

    it('answers Ctrl+Z and Ctrl+Shift+Z from anywhere in the window', () => {
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Sine'}));

      fireEvent.keyDown(window, {key: 'z', ctrlKey: true});
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'sine'),
      ).toBe(false);

      fireEvent.keyDown(window, {key: 'Z', ctrlKey: true, shiftKey: true});
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'sine'),
      ).toBe(true);
    });

    it('leaves Ctrl+Z alone while focus is in a text field', () => {
      // A learner mid-edit in a number or search field expects the field's
      // own text undo, not the document rolling back underneath them.
      const onChange = vi.fn();
      render(
        <EffectEditor
          initialDocument={createEffectDocument()}
          onChange={onChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Sine'}));
      const calls = onChange.mock.calls.length;

      const search = screen.getByRole('textbox', {name: 'Search nodes'});
      search.focus();
      fireEvent.keyDown(search, {key: 'z', ctrlKey: true});

      expect(onChange.mock.calls.length).toBe(calls);
      expect(
        lastDocument(onChange).nodes.some(node => node.type === 'sine'),
      ).toBe(true);
    });
  });
});
