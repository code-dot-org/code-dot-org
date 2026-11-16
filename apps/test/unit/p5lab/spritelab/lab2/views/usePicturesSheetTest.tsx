import {act, render, screen} from '@testing-library/react';
import React from 'react';

import usePicturesSheet from '@cdo/apps/p5lab/spritelab/lab2/views/usePicturesSheet';

type Sheet = ReturnType<typeof usePicturesSheet>;

const Harness: React.FunctionComponent<{
  latest: {current: Sheet | null};
}> = ({latest}) => {
  const sheet = usePicturesSheet({ready: false});
  latest.current = sheet;
  return (
    <div>
      {sheet.mounted ? 'mounted' : 'unmounted'} {sheet.open ? 'open' : 'closed'}
    </div>
  );
};

describe('usePicturesSheet', () => {
  it('mounts on opening and stays mounted after closing', () => {
    const latest = {current: null as Sheet | null};
    render(<Harness latest={latest} />);
    expect(screen.getByText('unmounted closed')).toBeTruthy();
    act(() => latest.current?.setOpen(true));
    expect(screen.getByText('mounted open')).toBeTruthy();
    act(() => latest.current?.setOpen(false));
    expect(screen.getByText('mounted closed')).toBeTruthy();
  });
});
