import {render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {CertificateCanvasPreview} from '../components/CertificateCanvasPreview';
import {loadCertificateFont} from '../lib/certificateFonts';
import * as exportCanvas from '../lib/exportCanvas';

it('awaits document.fonts.load for the certificate face', async () => {
  const load = vi.fn(() => Promise.resolve([] as FontFace[]));
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {load},
  });

  await loadCertificateFont();

  expect(load).toHaveBeenCalledWith('700 68px "Noto Serif"');
});

it('gates canvas drawing until the certificate font resolves', async () => {
  let resolveFonts: (() => void) | undefined;
  const load = vi.fn(
    () =>
      new Promise<FontFace[]>(resolve => {
        resolveFonts = () => resolve([]);
      }),
  );
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {load},
  });

  const renderCertificateToCanvas = vi
    .spyOn(exportCanvas, 'renderCertificateToCanvas')
    .mockImplementation(
      () => document.createElement('canvas') as HTMLCanvasElement,
    );
  Object.defineProperty(HTMLImageElement.prototype, 'complete', {
    configurable: true,
    get: () => true,
  });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
    configurable: true,
    get: () => 1754,
  });

  render(
    <CertificateCanvasPreview
      courseInfo={{
        courseType: 'hoc',
        localizedTitle: 'AI for Oceans',
        prefilledTitle: false,
        templateFilename: 'blank_certificate.png',
      }}
      params={{course: 'oceans', name: 'أمينة 李'}}
    />,
  );

  expect(screen.getByTestId('certificate-canvas-preview')).toBeVisible();
  expect(renderCertificateToCanvas).not.toHaveBeenCalled();
  await waitFor(() => expect(load).toHaveBeenCalled());

  resolveFonts?.();

  await waitFor(() => expect(renderCertificateToCanvas).toHaveBeenCalled());
});

it('labels the canvas with the student and course text', async () => {
  vi.spyOn(exportCanvas, 'renderCertificateToCanvas').mockImplementation(
    () => document.createElement('canvas') as HTMLCanvasElement,
  );

  render(
    <CertificateCanvasPreview
      courseInfo={{
        courseType: 'hoc',
        localizedTitle: 'AI for Oceans',
        prefilledTitle: false,
        templateFilename: 'blank_certificate.png',
      }}
      params={{course: 'oceans', name: 'أمينة 李'}}
    />,
  );

  expect(
    await screen.findByRole('img', {
      name: 'أمينة 李 certificate of completion for AI for Oceans',
    }),
  ).toBeInTheDocument();
});
