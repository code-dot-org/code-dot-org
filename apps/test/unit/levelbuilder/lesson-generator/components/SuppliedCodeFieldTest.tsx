import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SuppliedCodeField from '@cdo/apps/levelbuilder/lesson-generator/components/SuppliedCodeField';

describe('SuppliedCodeField', () => {
  const details = () =>
    screen.getByText('Supplied code (optional)').closest('details')!;

  it('starts open when code is present and closed when it is not', () => {
    const {unmount} = render(
      <SuppliedCodeField
        id="a"
        value="print(1)"
        disabled={false}
        onChange={() => {}}
      />
    );
    expect(details().open).toBe(true);
    unmount();
    render(
      <SuppliedCodeField id="b" value="" disabled={false} onChange={() => {}} />
    );
    expect(details().open).toBe(false);
  });

  it('stays open when the code is cleared', () => {
    const {rerender} = render(
      <SuppliedCodeField
        id="c"
        value="print(1)"
        disabled={false}
        onChange={() => {}}
      />
    );
    expect(details().open).toBe(true);
    rerender(
      <SuppliedCodeField id="c" value="" disabled={false} onChange={() => {}} />
    );
    expect(details().open).toBe(true);
  });

  it('reports edits through onChange', () => {
    const onChange = jest.fn();
    render(
      <SuppliedCodeField id="d" value="" disabled={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText('Supplied code'), {
      target: {value: 'x = 1'},
    });
    expect(onChange).toHaveBeenCalledWith('x = 1');
  });
});
