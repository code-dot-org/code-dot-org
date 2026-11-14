import {renderHook} from '@testing-library/react-hooks';

import useBodyClass from '@cdo/apps/p5lab/spritelab/lab2/views/useBodyClass';

describe('useBodyClass', () => {
  it('keeps the class on the body while mounted, and no longer', () => {
    expect(document.body.classList.contains('some-lab')).toBe(false);
    const {unmount} = renderHook(() => useBodyClass('some-lab'));
    expect(document.body.classList.contains('some-lab')).toBe(true);
    unmount();
    expect(document.body.classList.contains('some-lab')).toBe(false);
  });

  it('leaves other classes on the body alone', () => {
    document.body.classList.add('already-here');
    const {unmount} = renderHook(() => useBodyClass('some-lab'));
    unmount();
    expect(document.body.classList.contains('already-here')).toBe(true);
    document.body.classList.remove('already-here');
  });
});
