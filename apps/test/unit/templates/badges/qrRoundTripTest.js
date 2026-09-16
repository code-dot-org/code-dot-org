import jsQR from 'jsqr';
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel';
import QRCode from 'qr.js/lib/QRCode';

it('decodes a badge produced by the print encoder with a four-module quiet zone', () => {
  const payload = `CDO1.${'0a'.repeat(16)}.123.${'s_'.repeat(21)}Q`;
  const code = new QRCode(-1, ErrorCorrectLevel.M);
  code.addData(payload);
  code.make();
  const modules = code.getModuleCount();
  const scale = 5;
  const size = (modules + 8) * scale;
  const frame = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let row = 0; row < modules; row++) {
    for (let column = 0; column < modules; column++) {
      if (code.isDark(row, column)) {
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const offset =
              (((row + 4) * scale + y) * size + (column + 4) * scale + x) * 4;
            frame.fill(0, offset, offset + 3);
          }
        }
      }
    }
  }
  expect(jsQR(frame, size, size)?.data).toBe(payload);
});
