import {afterEach, vi} from 'vitest';

import {
  exportCertificateBlob,
  renderCertificateToCanvas,
} from './exportCertificateCanvas';

const hocCourseInfo = {
  courseType: 'hoc' as const,
  localizedTitle: 'AI for Oceans',
  prefilledTitle: false,
  templateFilename: 'blank_certificate.png',
};

function buildCanvasHarness() {
  const fillText = vi.fn();
  const measureText = vi.fn((text: string) => ({
    actualBoundingBoxAscent: 10,
    actualBoundingBoxDescent: 2,
    actualBoundingBoxLeft: Math.max(5, (text.length * 12) / 2),
    actualBoundingBoxRight: Math.max(5, (text.length * 12) / 2),
    fontBoundingBoxAscent: 12,
    fontBoundingBoxDescent: 3,
    width: Math.max(10, text.length * 12),
  }));
  const drawImage = vi.fn();
  const toBlob = vi.fn((callback: BlobCallback, mimeType?: string) =>
    callback(new Blob(['cert'], {type: mimeType})),
  );
  const context = {
    drawImage,
    fillStyle: '#000000',
    fillText,
    font: '',
    measureText,
    textAlign: 'start',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;
  const canvas = {
    getContext: vi.fn(() => context),
    height: 0,
    toBlob,
    width: 0,
  } as unknown as HTMLCanvasElement;

  return {canvas, context, drawImage, fillText, measureText, toBlob};
}

afterEach(() => {
  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,
    value: 1,
  });
});

it('renders exports at template-native dimensions independent of DPR', () => {
  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,
    value: 3,
  });

  const {canvas, drawImage, fillText} = buildCanvasHarness();

  const exportedCanvas = renderCertificateToCanvas({
    canvasFactory: () => canvas,
    courseInfo: hocCourseInfo,
    params: {course: 'oceans', name: 'Ada'},
    templateImage: {} as CanvasImageSource,
  });

  expect(exportedCanvas).toBe(canvas);
  expect(exportedCanvas.width).toBe(1754);
  expect(exportedCanvas.height).toBe(1240);
  expect(drawImage).toHaveBeenNthCalledWith(
    1,
    expect.anything(),
    0,
    0,
    1754,
    1240,
  );
  expect(fillText).toHaveBeenCalled();
});

it('draws the name centered at the layout offsets, not clipped to a box', () => {
  const {canvas, fillText} = buildCanvasHarness();

  renderCertificateToCanvas({
    canvasFactory: () => canvas,
    courseInfo: hocCourseInfo,
    params: {course: 'oceans', name: 'Ada'},
    templateImage: {} as CanvasImageSource,
  });

  // 1754/2 + 0 xOffset, 1240/2 - 135 yOffset (blank_certificate.png name layout)
  expect(fillText).toHaveBeenCalledWith('Ada', 877, 485);
});

it('draws every wrapped line for a long name', () => {
  const {canvas, fillText} = buildCanvasHarness();
  // Prefilled templates draw only the name (no separate title text), so
  // every fillText call below belongs to the wrapped name.
  const prefilledCourseInfo = {
    ...hocCourseInfo,
    prefilledTitle: true,
    templateFilename: 'oceans_hoc_certificate.png',
  };

  renderCertificateToCanvas({
    canvasFactory: () => canvas,
    courseInfo: prefilledCourseInfo,
    params: {
      course: 'oceans',
      name: Array(40).fill('Overflow').join(' '),
    },
    templateImage: {} as CanvasImageSource,
  });

  expect(fillText.mock.calls.length).toBeGreaterThan(1);
});

it('draws mixed-bidi names without clipping (no clip rect, no offscreen bitmap)', () => {
  const {canvas, fillText} = buildCanvasHarness();

  renderCertificateToCanvas({
    canvasFactory: () => canvas,
    courseInfo: hocCourseInfo,
    params: {course: 'oceans', name: 'Maya שלום'},
    templateImage: {} as CanvasImageSource,
  });

  expect(fillText).toHaveBeenCalledWith(
    'Maya שלום',
    expect.any(Number),
    expect.any(Number),
  );
});

it('sets the resolved font weight and family before each fillText', () => {
  const {canvas, context} = buildCanvasHarness();

  renderCertificateToCanvas({
    canvasFactory: () => canvas,
    courseInfo: hocCourseInfo,
    params: {course: 'oceans', name: 'Ada'},
    templateImage: {} as CanvasImageSource,
  });

  expect(context.font).toContain('700');
  expect(context.font).toContain('Noto Serif');
});

it('skips drawing for blank names', () => {
  const {canvas, fillText} = buildCanvasHarness();
  const prefilledCourseInfo = {
    ...hocCourseInfo,
    prefilledTitle: true,
    templateFilename: 'oceans_hoc_certificate.png',
  };

  renderCertificateToCanvas({
    canvasFactory: () => canvas,
    courseInfo: prefilledCourseInfo,
    params: {course: 'oceans', name: ''},
    templateImage: {} as CanvasImageSource,
  });

  expect(fillText).not.toHaveBeenCalled();
});

it('exports certificate blobs through canvas toBlob', async () => {
  const {canvas, toBlob} = buildCanvasHarness();

  const blob = await exportCertificateBlob({
    canvasFactory: () => canvas,
    courseInfo: hocCourseInfo,
    mimeType: 'image/jpeg',
    params: {course: 'oceans', name: 'Ada'},
    quality: 0.92,
    templateImage: {} as CanvasImageSource,
  });

  expect(blob.type).toBe('image/jpeg');
  expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.92);
});

it('exports webp certificate blobs through canvas toBlob', async () => {
  const {canvas, toBlob} = buildCanvasHarness();

  const blob = await exportCertificateBlob({
    canvasFactory: () => canvas,
    courseInfo: hocCourseInfo,
    mimeType: 'image/webp',
    params: {course: 'oceans', name: 'Ada'},
    quality: 0.92,
    templateImage: {} as CanvasImageSource,
  });

  expect(blob.type).toBe('image/webp');
  expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.92);
});
