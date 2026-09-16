import jsQR from 'jsqr';

import {
  createDecoder,
  isBadgePayload,
} from '@cdo/apps/templates/badges/decoder';

jest.mock('jsqr');

const payload = `CDO1.${'a'.repeat(32)}.1.${'b'.repeat(43)}`;
const video = {videoWidth: 640, videoHeight: 480};

afterEach(() => {
  delete window.BarcodeDetector;
  jest.restoreAllMocks();
});

it('accepts only the complete versioned badge format', () => {
  expect(isBadgePayload(payload)).toBe(true);
  for (const value of [
    null,
    {},
    `${payload}\n`,
    `${payload}\r`,
    `https://example.com/${payload}`,
    payload.replace('CDO1', 'CDO2'),
    'a'.repeat(1000),
  ]) {
    expect(isBadgePayload(value)).toBe(false);
  }
});

it('uses a QR-capable native detector', async () => {
  const detect = jest
    .fn()
    .mockResolvedValue([{rawValue: 'unrelated'}, {rawValue: payload}]);
  window.BarcodeDetector = jest.fn().mockImplementation(() => ({detect}));
  window.BarcodeDetector.getSupportedFormats = jest
    .fn()
    .mockResolvedValue(['qr_code']);
  const decode = await createDecoder();
  expect(await decode(video)).toBe(payload);
  expect(jsQR).not.toHaveBeenCalled();
});

it('decodes frames locally when native QR detection is absent or fails', async () => {
  const frame = {data: new Uint8ClampedArray(4), width: 1, height: 1};
  const context = {
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue(frame),
  };
  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context);
  jsQR.mockReturnValue({data: payload});
  let decode = await createDecoder();
  expect(await decode(video)).toBe(payload);
  expect(jsQR).toHaveBeenCalledWith(frame.data, 1, 1);
  window.BarcodeDetector = jest.fn().mockImplementation(() => ({
    detect: () => Promise.reject(new Error('unsupported')),
  }));
  window.BarcodeDetector.getSupportedFormats = jest
    .fn()
    .mockResolvedValue(['qr_code']);
  decode = await createDecoder();
  expect(await decode(video)).toBe(payload);
});
