import {act, render, screen} from '@testing-library/react';
import React from 'react';

import {requestPicture} from '@cdo/apps/p5lab/spritelab/lab2/picturePicker';
import usePicturesSheet from '@cdo/apps/p5lab/spritelab/lab2/views/usePicturesSheet';

type Sheet = ReturnType<typeof usePicturesSheet>;

const Harness: React.FunctionComponent<{
  offered: boolean;
  latest: {current: Sheet | null};
}> = ({offered, latest}) => {
  const sheet = usePicturesSheet({offered, ready: false});
  latest.current = sheet;
  return (
    <div>
      {sheet.mounted ? 'mounted' : 'unmounted'} {sheet.open ? 'open' : 'closed'}{' '}
      {sheet.pickRequest?.imageType ?? 'no pick'}
    </div>
  );
};

describe('usePicturesSheet', () => {
  it('answers a picture request by mounting, and hands the picture back', () => {
    const latest = {current: null as Sheet | null};
    render(<Harness offered latest={latest} />);
    expect(screen.getByText('unmounted closed no pick')).toBeTruthy();
    const onPicked = jest.fn();
    act(() => {
      expect(requestPicture({imageType: 'block', onPicked})).toBe(true);
    });
    expect(screen.getByText('mounted closed block')).toBeTruthy();
    act(() => latest.current?.onImageCreated('crate', 'block'));
    expect(onPicked).toHaveBeenCalledWith('crate', 'block');
    expect(screen.getByText('mounted closed no pick')).toBeTruthy();
  });

  it('mounts on opening, and answers nothing where Pictures is withheld', () => {
    const latest = {current: null as Sheet | null};
    render(<Harness offered={false} latest={latest} />);
    expect(requestPicture({onPicked: jest.fn()})).toBe(false);
    act(() => latest.current?.setOpen(true));
    expect(screen.getByText('mounted open no pick')).toBeTruthy();
  });
});
