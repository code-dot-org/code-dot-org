import jsQR from 'jsqr';

export const isBadgePayload = value =>
  typeof value === 'string' &&
  value.length <= 128 &&
  /^CDO1\.[0-9a-f]{32}\.[1-9][0-9]{0,8}\.[A-Za-z0-9_-]{43}$(?![\s\S])/.test(
    value
  );

export async function createDecoder() {
  let native;
  try {
    if (
      window.BarcodeDetector &&
      (await window.BarcodeDetector.getSupportedFormats()).includes('qr_code')
    ) {
      native = new window.BarcodeDetector({formats: ['qr_code']});
    }
  } catch {
    native = undefined;
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', {willReadFrequently: true});
  return async video => {
    if (!video.videoWidth || !video.videoHeight) {
      return;
    }
    if (native) {
      try {
        const codes = await native.detect(video);
        return codes.find(code => isBadgePayload(code.rawValue))?.rawValue;
      } catch {
        native = undefined;
      }
    }
    if (!context) {
      throw new Error('Camera decoding unavailable');
    }
    const scale = Math.min(1, 640 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(frame.data, frame.width, frame.height);
    return isBadgePayload(code?.data) ? code.data : undefined;
  };
}
