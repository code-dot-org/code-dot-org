import {fitToView} from '../../src/helpers/fitToView';

describe('fitToView', () => {
  const viewport = {width: 400, height: 300};

  test('scales a rect down to fit inside the padding and centers it', () => {
    const rect = {x: 0, y: 0, width: 720, height: 200};
    const {x, y, scale} = fitToView(rect, viewport, 20, 1);

    expect(scale).toBe(0.5);
    expect(x + (scale * rect.width) / 2).toBe(viewport.width / 2);
    expect(y + (scale * rect.height) / 2).toBe(viewport.height / 2);
  });

  test('uses the tighter of the two axes', () => {
    const rect = {x: 0, y: 0, width: 100, height: 520};

    expect(fitToView(rect, viewport, 20, 1).scale).toBe(0.5);
  });

  test('never scales past maxScale', () => {
    const rect = {x: 0, y: 0, width: 36, height: 26};

    expect(fitToView(rect, viewport, 20, 1).scale).toBe(1);
  });

  test('centers a rect that does not start at the origin', () => {
    const rect = {x: 500, y: 1000, width: 100, height: 50};
    const {x, y, scale} = fitToView(rect, viewport, 20, 1);

    expect(x + scale * (rect.x + rect.width / 2)).toBe(viewport.width / 2);
    expect(y + scale * (rect.y + rect.height / 2)).toBe(viewport.height / 2);
  });
});
