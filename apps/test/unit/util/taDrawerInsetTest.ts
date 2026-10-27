import {
  availableContentWidth,
  setTaDrawerInset,
} from '@cdo/apps/util/taDrawerInset';

const inset = () =>
  document.documentElement.style.getPropertyValue('--ta-drawer-width');
const transition = () =>
  document.documentElement.style.getPropertyValue('--ta-drawer-transition');

describe('taDrawerInset', () => {
  afterEach(() => setTaDrawerInset(0));

  it('publishes the inset for shells to read in CSS', () => {
    setTaDrawerInset(400);

    expect(inset()).toBe('400px');
  });

  it('animates in on the enter curve and out on the leave curve', () => {
    setTaDrawerInset(400);
    const opening = transition();

    setTaDrawerInset(0);

    expect(opening).not.toBe('');
    expect(transition()).not.toBe(opening);
  });

  it('subtracts the inset from the width available to a lab', () => {
    const full = availableContentWidth();

    setTaDrawerInset(400);

    expect(availableContentWidth()).toBe(full - 400);
  });

  it('fires a resize so labs redo their width math', () => {
    const onResize = jest.fn();
    window.addEventListener('resize', onResize);

    setTaDrawerInset(400);

    expect(onResize).toHaveBeenCalled();
    window.removeEventListener('resize', onResize);
  });
});
