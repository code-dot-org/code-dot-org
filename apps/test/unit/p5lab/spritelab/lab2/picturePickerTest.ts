import {
  requestPicture,
  setPictureRequestHandler,
} from '@cdo/apps/p5lab/spritelab/lab2/picturePicker';

describe('SpriteLab2 picturePicker', () => {
  it('hands a request to the registered handler, and reports none', () => {
    const request = {imageType: 'block' as const, onPicked: jest.fn()};
    expect(requestPicture(request)).toBe(false);
    const handler = jest.fn();
    const unregister = setPictureRequestHandler(handler);
    expect(requestPicture(request)).toBe(true);
    expect(handler).toHaveBeenCalledWith(request);
    unregister();
    expect(requestPicture(request)).toBe(false);
  });

  it('unregisters only the handler it registered', () => {
    const first = jest.fn();
    const second = jest.fn();
    const unregisterFirst = setPictureRequestHandler(first);
    setPictureRequestHandler(second);
    unregisterFirst();
    expect(requestPicture({onPicked: jest.fn()})).toBe(true);
    expect(second).toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
    setPictureRequestHandler(() => undefined)();
  });
});
