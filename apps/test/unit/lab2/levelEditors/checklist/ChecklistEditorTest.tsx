import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';
import {z} from 'zod';

import {checklistSchema} from '@cdo/apps/lab2/checklist/checklistSchema';
import ChecklistEditor from '@cdo/apps/lab2/levelEditors/checklist/ChecklistEditor';

// A lab of its own, with two kinds of check.
const schema = checklistSchema(
  z.discriminatedUnion('kind', [
    z.strictObject({kind: z.literal('ran')}).meta({title: 'Ran the code'}),
    z
      .strictObject({
        kind: z.literal('typed'),
        word: z.string().min(1, 'Required.').meta({title: 'Word'}),
      })
      .meta({title: 'Typed a word'}),
  ])
);

function Harness() {
  const [value, setValue] = useState<unknown>({});
  return (
    <>
      <ChecklistEditor
        schema={schema}
        value={value}
        onChange={next => {
          latest = next;
          setValue(next);
        }}
      />
    </>
  );
}

// The value the form handed on last.
let latest: unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = () => latest as any;

describe('ChecklistEditor', () => {
  it('works on its own, with a lab’s own kinds of check', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name: 'Add step'}));
    expect(value()).toEqual({steps: [{text: '', check: {kind: 'ran'}}]});
    fireEvent.change(screen.getByRole('combobox', {name: 'Done when'}), {
      target: {value: '1'},
    });
    expect(value().steps[0].check).toEqual({kind: 'typed', word: ''});
    expect(screen.getAllByText('Required.')).toHaveLength(2);
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Hide this step until something is done',
      })
    );
    expect(value().steps[0].shownWhen).toEqual({kind: 'ran'});
  });
});
