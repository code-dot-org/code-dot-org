import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import Sheet from '@cdo/apps/p5lab/spritelab/lab2/views/components/Sheet';

describe('Sheet', () => {
  it('names its region, shows its content, and reports Done', () => {
    const onDone = jest.fn();
    render(
      <Sheet title="Pictures" onDone={onDone}>
        <p>the pictures</p>
      </Sheet>
    );
    expect(screen.getByRole('region', {name: 'Pictures'})).toBeTruthy();
    expect(screen.getByText('the pictures')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(onDone).toHaveBeenCalled();
  });

  it('keeps a closed sheet mounted, marked closed', () => {
    render(
      <Sheet title="Pictures" closed onDone={jest.fn()}>
        <p>still here</p>
      </Sheet>
    );
    const region = screen.getByRole('region', {name: 'Pictures'});
    expect(region.className).toContain('sheetClosed');
    expect(screen.getByText('still here')).toBeTruthy();
  });
});
