import {SketchCaptureError} from '@cdo/apps/sketchlab/reactFlow/utils/SketchCaptureError';

describe('SketchCaptureError', () => {
  it('uses the cause message for an Error', () => {
    const error = new SketchCaptureError(new Error('tainted canvas'), {
      imageWidth: 100,
    });

    expect(error.message).toBe('Sketch capture failed: tainted canvas');
    expect(error.details).toEqual({reason: 'tainted canvas', imageWidth: 100});
  });

  it('describes an image load Event with a truncated source', () => {
    const image = document.createElement('img');
    const source = `data:image/svg+xml;charset=utf-8,${'a'.repeat(200)}`;
    image.src = source;
    const event = new Event('error');
    image.dispatchEvent(event);

    const error = new SketchCaptureError(event, {});

    expect(error.details).toEqual({
      reason: 'error loading IMG',
      source: source.slice(0, 64),
      sourceLength: source.length,
    });
  });

  it('omits the source for an Event without one', () => {
    const div = document.createElement('div');
    const event = new Event('error');
    div.dispatchEvent(event);

    expect(new SketchCaptureError(event, {}).details).toEqual({
      reason: 'error loading DIV',
    });
  });

  it('stringifies any other cause', () => {
    expect(new SketchCaptureError('boom', {}).details).toEqual({
      reason: 'boom',
    });
  });
});
