import {useCallback, useEffect, useRef, useState} from 'react';
import type {MutableRefObject} from 'react';

import {CertificateTemplatePicture} from '@/components/CertificateTemplatePicture';
import {resolveTemplateLayout} from '@/layout';
import {useCertificateFontReady} from '@/lib/certificateFonts';
import {renderCertificateToCanvas} from '@/lib/exportCanvas';
import type {CertificateCourseInfo, CertificateParams} from '@/lib/types';

export function CertificateCanvasPreview({
  courseInfo,
  onRendered,
  params,
  templateImageRef,
}: {
  courseInfo: CertificateCourseInfo;
  /** Fires after each completed canvas draw (fonts and template resolved). */
  onRendered?: () => void;
  params: CertificateParams;
  templateImageRef?:
    | ((image: HTMLImageElement | null) => void)
    | MutableRefObject<HTMLImageElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [templateReady, setTemplateReady] = useState(false);
  const templateLayout = resolveTemplateLayout(courseInfo.templateFilename);
  const fontsReady = useCertificateFontReady();
  const canvasLabel = params.name
    ? `${params.name} certificate of completion for ${courseInfo.localizedTitle}`
    : `${courseInfo.localizedTitle} certificate of completion`;

  useEffect(() => {
    if (!templateImage) {
      setTemplateReady(false);
      return;
    }

    if (templateImage.complete && templateImage.naturalWidth > 0) {
      setTemplateReady(true);
      return;
    }

    setTemplateReady(false);
    const handleLoad = () => setTemplateReady(true);
    const handleError = () => setTemplateReady(false);

    templateImage.addEventListener('load', handleLoad);
    templateImage.addEventListener('error', handleError);

    return () => {
      templateImage.removeEventListener('load', handleLoad);
      templateImage.removeEventListener('error', handleError);
    };
  }, [templateImage]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !templateImage || !templateReady || !fontsReady) {
      return;
    }

    renderCertificateToCanvas({
      canvasFactory: () => canvas,
      courseInfo,
      params,
      templateImage,
    });
    onRendered?.();
  }, [
    courseInfo,
    fontsReady,
    onRendered,
    params,
    templateImage,
    templateReady,
  ]);

  const handleTemplateImageRef = useCallback(
    (image: HTMLImageElement | null) => {
      setTemplateImage(image);

      if (!templateImageRef) {
        return;
      }

      if (typeof templateImageRef === 'function') {
        templateImageRef(image);
      } else {
        // eslint-disable-next-line react-hooks/immutability -- forwarding to a caller-owned MutableRefObject is the documented API of this prop, not a render-affecting mutation.
        templateImageRef.current = image;
      }
    },
    [templateImageRef],
  );

  return (
    <div
      data-testid="certificate-canvas-stage"
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        aria-label={canvasLabel}
        role="img"
        style={{
          aspectRatio: `${templateLayout.nativeWidth} / ${templateLayout.nativeHeight}`,
          position: 'relative',
          width: '100%',
        }}
      >
        <CertificateTemplatePicture
          imageRef={handleTemplateImageRef}
          templateFilename={courseInfo.templateFilename}
        />
        <canvas
          aria-hidden="true"
          data-testid="certificate-canvas-preview"
          ref={canvasRef}
          style={{
            display: 'block',
            height: '100%',
            inset: 0,
            position: 'absolute',
            width: '100%',
          }}
        />
      </div>
    </div>
  );
}
