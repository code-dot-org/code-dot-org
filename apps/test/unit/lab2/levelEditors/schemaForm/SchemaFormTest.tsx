import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';
import {z} from 'zod';

import '@cdo/apps/lab2/levelEditors/schemaForm/schemaMeta';
import SchemaForm, {
  problemsFrom,
} from '@cdo/apps/lab2/levelEditors/schemaForm/SchemaForm';

const schema = z.strictObject({
  name: z.string().optional().meta({title: 'Name'}),
  world: z
    .strictObject({
      size: z.enum(['small', 'big']).optional().meta({title: 'Size'}),
      roles: z
        .array(z.string())
        .optional()
        .meta({title: 'Roles', widget: 'names'}),
    })
    .optional()
    .meta({title: 'World', feature: 'World tab'}),
  canAdd: z.boolean().optional().meta({title: 'Can add', defaultValue: true}),
  steps: z
    .array(
      z
        .strictObject({
          text: z.string().min(1, 'Required.').meta({title: 'Text'}),
        })
        .meta({title: 'Step'})
    )
    .optional()
    .meta({title: 'Steps'}),
  check: z
    .discriminatedUnion('kind', [
      z.strictObject({kind: z.literal('play')}).meta({title: 'Pressed Run'}),
      z
        .strictObject({
          kind: z.literal('scene'),
          id: z.string().meta({title: 'Scene id'}),
        })
        .meta({title: 'Got to a scene'}),
    ])
    .optional()
    .meta({title: 'Done when'}),
});

function Harness({initial}: {initial: unknown}) {
  const [value, setValue] = useState<unknown>(initial);
  const result = schema.safeParse(value);
  return (
    <>
      <SchemaForm
        schema={schema}
        value={value}
        onChange={next => {
          latest = next;
          setValue(next);
        }}
        problems={problemsFrom(result.success ? [] : result.error.issues)}
      />
    </>
  );
}

// The value the form handed on last.
let latest: unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = () => latest as any;

describe('SchemaForm', () => {
  it('starts sections closed, shows their problems, and opens them all at once', () => {
    render(<Harness initial={{steps: [{text: 'one'}, {text: ''}]}} />);
    // Only the top-level Name field shows.
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByText('1 problem')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Open all'}));
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('turns a feature on with its switch, and then shows its settings', () => {
    render(<Harness initial={{}} />);
    expect(screen.queryByText('Size')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', {name: 'World tab'}));
    expect(value()).toEqual({world: {}});
    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  it('writes a setting left at its default as no value', () => {
    render(<Harness initial={{}} />);
    const box = screen.getByRole('checkbox', {name: 'Can add'});
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(value()).toEqual({canAdd: false});
    fireEvent.click(box);
    expect(value()).toEqual({});
  });

  it('adds, moves and removes list items', () => {
    render(<Harness initial={{steps: [{text: 'one'}]}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Add step'}));
    expect(value().steps).toEqual([{text: 'one'}, {text: ''}]);
    expect(screen.getByText('Required.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Move Step 2 up'}));
    expect(value().steps).toEqual([{text: ''}, {text: 'one'}]);
    fireEvent.click(screen.getByRole('button', {name: 'Remove Step 1'}));
    expect(value().steps).toEqual([{text: 'one'}]);
  });

  it('switches between the shapes of a choice and shows the chosen fields', () => {
    render(<Harness initial={{check: {kind: 'play'}}} />);
    expect(screen.queryByText('Scene id')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', {name: 'Done when'}), {
      target: {value: '1'},
    });
    expect(value().check).toEqual({kind: 'scene', id: ''});
    expect(screen.getByText('Scene id')).toBeInTheDocument();
  });

  it('reads names typed with commas', () => {
    render(<Harness initial={{world: {}}} />);
    expect(screen.queryByRole('textbox', {name: 'Roles'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Settings'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Roles'}), {
      target: {value: 'hero, friend'},
    });
    expect(value().world.roles).toEqual(['hero', 'friend']);
  });
});
