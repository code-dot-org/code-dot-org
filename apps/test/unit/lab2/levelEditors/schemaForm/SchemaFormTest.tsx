import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';
import {z} from 'zod';

import '@cdo/apps/lab2/levelEditors/schemaForm/schemaMeta';
import SchemaForm, {
  problemsFrom,
  referenceOptions,
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
  project: z.literal(true).optional().meta({title: 'Project step'}),
  dialog: z
    .strictObject({heading: z.string().min(1).meta({title: 'Heading'})})
    .optional()
    .meta({title: 'Dialog'}),
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
    // An item added after Close all still starts open.
    fireEvent.click(screen.getByRole('button', {name: 'Add step'}));
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('turns a feature on with its switch, and then shows its settings', () => {
    render(<Harness initial={{}} />);
    expect(screen.queryByText('Size')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', {name: 'World tab'}));
    expect(value()).toEqual({world: {}});
    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  it('adds and removes optional content with buttons, keeping what was removed', () => {
    render(<Harness initial={{dialog: {heading: 'Hello'}}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Remove Dialog'}));
    expect(value()).toEqual({});
    // Closing every section in between keeps what was removed.
    fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
    fireEvent.click(screen.getByRole('button', {name: 'Add Dialog'}));
    expect(value()).toEqual({dialog: {heading: 'Hello'}});
  });

  it('keeps a feature switched off, and restores it when switched back on', () => {
    render(<Harness initial={{world: {size: 'big'}}} />);
    const box = screen.getByRole('checkbox', {name: 'World tab'});
    fireEvent.click(box);
    expect(value()).toEqual({});
    fireEvent.click(box);
    expect(value()).toEqual({world: {size: 'big'}});
  });

  it('says Required. for an empty required field', () => {
    render(<Harness initial={{steps: [{text: ''}]}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Open all'}));
    expect(screen.getByText('Required.')).toBeInTheDocument();
  });

  it('draws an optional fixed value as a box that writes it or leaves it out', () => {
    render(<Harness initial={{}} />);
    const box = screen.getByRole('checkbox', {name: 'Project step'});
    fireEvent.click(box);
    expect(value()).toEqual({project: true});
    fireEvent.click(box);
    expect(value()).toEqual({});
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

describe('reference fields', () => {
  const pathway = z.strictObject({
    skills: z.record(z.string(), z.strictObject({title: z.string()})),
    checkpoint: z
      .strictObject({
        skillIds: z
          .array(z.string())
          .optional()
          .meta({title: 'Skills', widget: 'reference', options: 'skills.*'}),
      })
      .meta({title: 'Checkpoint'}),
  });

  it('lists a map’s keys, labeled with their titles', () => {
    expect(
      referenceOptions(
        {skills: {build: {title: 'Build with AI'}, debug: {title: 'Debug'}}},
        'skills.*'
      )
    ).toEqual([
      {value: 'build', label: 'build: Build with AI'},
      {value: 'debug', label: 'debug: Debug'},
    ]);
    expect(
      referenceOptions(
        {steps: [{id: 'a', title: 'First'}, {id: 'b'}]},
        'steps.*.id'
      )
    ).toEqual([
      {value: 'a', label: 'a: First'},
      {value: 'b', label: 'b'},
    ]);
  });

  it('ticks choices from elsewhere in the value, and keeps one not found', () => {
    let latest: unknown;
    function Form() {
      const [value, setValue] = useState<unknown>({
        skills: {build: {title: 'Build'}, debug: {title: 'Debug'}},
        checkpoint: {skillIds: ['gone']},
      });
      return (
        <SchemaForm
          schema={pathway}
          value={value}
          onChange={next => {
            latest = next;
            setValue(next);
          }}
        />
      );
    }
    render(<Form />);
    fireEvent.click(screen.getByRole('button', {name: 'Open all'}));
    expect(
      screen.getByText(/Not found, kept as it is: gone/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', {name: 'debug: Debug'}));
    expect((latest as {checkpoint: unknown}).checkpoint).toEqual({
      skillIds: ['gone', 'debug'],
    });
  });
});
