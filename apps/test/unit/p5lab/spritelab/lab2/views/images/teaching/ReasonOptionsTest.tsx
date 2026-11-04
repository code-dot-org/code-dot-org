import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ReasonOptions from '@cdo/apps/p5lab/spritelab/lab2/views/images/teaching/ReasonOptions';

const options = [
  {value: 'matches', label: 'Matches my prompt'},
  {value: 'great', label: 'Looks great'},
];

describe('ReasonOptions', () => {
  it('groups the reasons under the question and reports each pick', () => {
    const onChange = jest.fn();
    render(
      <ReasonOptions
        name="reasons"
        legend="What did AI do well?"
        options={options}
        values={['great']}
        onChange={onChange}
      />
    );
    const group = screen.getByRole('group', {name: 'What did AI do well?'});
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getByLabelText('Looks great')).toBeChecked();
    fireEvent.click(screen.getByLabelText('Matches my prompt'));
    expect(onChange).toHaveBeenCalledWith(['great', 'matches']);
    fireEvent.click(screen.getByLabelText('Looks great'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
