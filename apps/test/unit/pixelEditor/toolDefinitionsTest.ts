import {toolAfterColorChoice} from '@cdo/apps/pixelEditor/toolDefinitions';

describe('toolAfterColorChoice', () => {
  it('hands the eraser over to the pen, and leaves other tools in hand', () => {
    const offered = ['pen', 'bucket', 'eraser', 'eyedropper'] as const;
    expect(toolAfterColorChoice('eraser', offered)).toBe('pen');
    expect(toolAfterColorChoice('bucket', offered)).toBe('bucket');
    expect(toolAfterColorChoice('pen', offered)).toBe('pen');
  });

  it('keeps the eraser where no pen is offered', () => {
    expect(toolAfterColorChoice('eraser', ['bucket', 'eraser'])).toBe('eraser');
  });
});
