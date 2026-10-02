import {fitToView} from '../../src/helpers/fitToView';

describe('fitToView', () => {
  const frame = {x: 20, y: 20, width: 360, height: 260};
  const frameCenterX = frame.x + frame.width / 2;
  const frameCenterY = frame.y + frame.height / 2;

  test('scales a rect down to fit inside the frame and centers it', () => {
    const rect = {x: 0, y: 0, width: 720, height: 200};
    const {x, y, scale} = fitToView(rect, frame, 1);

    expect(scale).toBe(0.5);
    expect(x + (scale * rect.width) / 2).toBe(frameCenterX);
    expect(y + (scale * rect.height) / 2).toBe(frameCenterY);
  });

  test('uses the tighter of the two axes', () => {
    const rect = {x: 0, y: 0, width: 100, height: 520};

    expect(fitToView(rect, frame, 1).scale).toBe(0.5);
  });

  test('never scales past maxScale', () => {
    const rect = {x: 0, y: 0, width: 36, height: 26};

    expect(fitToView(rect, frame, 1).scale).toBe(1);
  });

  test('centers a rect that does not start at the origin', () => {
    const rect = {x: 500, y: 1000, width: 100, height: 50};
    const {x, y, scale} = fitToView(rect, frame, 1);

    expect(x + scale * (rect.x + rect.width / 2)).toBe(frameCenterX);
    expect(y + scale * (rect.y + rect.height / 2)).toBe(frameCenterY);
  });

  test('fits nothing into a frame with no room', () => {
    const rect = {x: 0, y: 0, width: 100, height: 50};

    expect(fitToView(rect, {...frame, width: -8}, 1)).toBeUndefined();
    expect(fitToView(rect, {...frame, height: 0}, 1)).toBeUndefined();
  });
});
