import {loadCertificateFont} from '@/certificate/canvas/certificateFonts';
import {
  fitCertificateText,
  type TextMeasurer,
} from '@/certificate/canvas/fitCertificateText';
import {resolveTemplateLayout} from '@/certificate/model/certificateLayouts';
import {
  resolveCertificateRenderableTexts,
  type CertificateRenderableText,
} from '@/certificate/model/certificateRenderModel';
import type {
  CertificateCourseInfo,
  CertificateParams,
} from '@/certificate/model/certificateTypes';

export type CertificateExportMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

// Pango lays out "points" at 96dpi, same as CSS px-per-pt; layout.ts fontSize
// values are pango pointsizes transcribed from certificate_image.rb.
export const PANGO_PT_TO_PX = 96 / 72;
export const CERTIFICATE_FONT_FAMILY = '"Noto Serif", serif';
const CERTIFICATE_FONT_WEIGHT = '700';

type CanvasFactory = () => HTMLCanvasElement;

function fontString(fontSizePx: number): string {
  return `${CERTIFICATE_FONT_WEIGHT} ${fontSizePx}px ${CERTIFICATE_FONT_FAMILY}`;
}

function resolveLineHeightPx(metrics: TextMetrics, fontSizePx: number): number {
  const ascent = metrics.fontBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent;

  if (typeof ascent === 'number' && typeof descent === 'number') {
    return ascent + descent;
  }

  return fontSizePx * 1.2;
}

function createTextMeasurer(context: CanvasRenderingContext2D): TextMeasurer {
  return (text, fontSize) => {
    const fontSizePx = fontSize * PANGO_PT_TO_PX;
    context.font = fontString(fontSizePx);
    const metrics = context.measureText(text);

    return {
      height: resolveLineHeightPx(metrics, fontSizePx),
      width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
    };
  };
}

function drawRenderableText(
  context: CanvasRenderingContext2D,
  renderableText: CertificateRenderableText,
) {
  const fittedText = fitCertificateText({
    boxHeight: renderableText.boxHeight,
    boxWidth: renderableText.boxWidth,
    fontSize: renderableText.fontSize,
    measureText: createTextMeasurer(context),
    text: renderableText.text,
  });

  if (fittedText.lines.length === 0) {
    return;
  }

  const fontSizePx = fittedText.fontSize * PANGO_PT_TO_PX;
  context.font = fontString(fontSizePx);
  context.fillStyle = renderableText.color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const blockHeight = fittedText.lineHeight * fittedText.lines.length;
  const firstLineCenterY =
    renderableText.centerY - blockHeight / 2 + fittedText.lineHeight / 2;

  fittedText.lines.forEach((line, index) => {
    context.fillText(
      line,
      renderableText.centerX,
      firstLineCenterY + index * fittedText.lineHeight,
    );
  });
}

export function renderCertificateToCanvas({
  canvasFactory,
  courseInfo,
  params,
  templateImage,
}: {
  canvasFactory?: CanvasFactory;
  courseInfo: CertificateCourseInfo;
  params: CertificateParams;
  templateImage: CanvasImageSource;
}): HTMLCanvasElement {
  const templateLayout = resolveTemplateLayout(courseInfo.templateFilename);
  const renderableTexts = resolveCertificateRenderableTexts(courseInfo, params);
  const canvas = canvasFactory?.() || document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Certificate export requires a 2d canvas context');
  }

  canvas.width = templateLayout.nativeWidth;
  canvas.height = templateLayout.nativeHeight;
  context.drawImage(
    templateImage,
    0,
    0,
    templateLayout.nativeWidth,
    templateLayout.nativeHeight,
  );
  renderableTexts.forEach(renderableText =>
    drawRenderableText(context, renderableText),
  );

  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: CertificateExportMimeType,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      reject(new Error('Canvas export requires HTMLCanvasElement.toBlob'));
      return;
    }

    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas export produced an empty blob'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export async function exportCertificateBlob({
  canvasFactory,
  courseInfo,
  mimeType,
  params,
  quality,
  templateImage,
}: {
  canvasFactory?: CanvasFactory;
  courseInfo: CertificateCourseInfo;
  mimeType: CertificateExportMimeType;
  params: CertificateParams;
  quality?: number;
  templateImage: CanvasImageSource;
}): Promise<Blob> {
  await loadCertificateFont();
  const canvas = renderCertificateToCanvas({
    canvasFactory,
    courseInfo,
    params,
    templateImage,
  });

  return canvasToBlob(canvas, mimeType, quality);
}
