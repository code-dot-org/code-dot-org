import {useCallback, useMemo, useRef} from 'react';

import Alert from '@code-dot-org/component-library/alert';

import {CertificateCanvasPreview} from '@/certificate/canvas/CertificateCanvasPreview';
import type {CertificateParams} from '@/certificate/model/certificateTypes';
import {decodeCertificateParams} from '@/routing/certificateParams';

import {useCertificateCourse} from '../api/useCertificateCourse';

import './certificatePrint.css';
import styles from './certificatePrintPage.module.css';

/**
 * /print_certificates/:encoded_params — the certificate alone, sized for a
 * landscape print. The print dialog opens automatically once the certificate
 * has drawn (fonts and template resolved), so the printed page never shows a
 * half-rendered canvas.
 */
export function CertificatePrintPage({encodedParams}: {encodedParams: string}) {
  const printed = useRef(false);
  const printOnceRendered = useCallback(() => {
    if (printed.current) {
      return;
    }

    printed.current = true;
    // Two frames: one for the canvas paint to reach the screen, one so the
    // dialog opens against the final layout.
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }, []);
  const decodedParams = useMemo<CertificateParams | null>(() => {
    try {
      return decodeCertificateParams(encodedParams);
    } catch {
      return null;
    }
  }, [encodedParams]);

  const {courseInfo, error} = useCertificateCourse(
    decodedParams?.course ?? null,
  );

  if (!decodedParams) {
    return (
      <div className={styles.page}>
        <Alert
          text="This certificate link is invalid. Check the URL and try again."
          type="danger"
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {error && (
        <Alert
          text="Something went wrong loading this certificate. Refresh the page to try again."
          type="danger"
        />
      )}
      {courseInfo && (
        <div className={styles.certificate}>
          <CertificateCanvasPreview
            courseInfo={courseInfo}
            onRendered={printOnceRendered}
            params={decodedParams}
          />
        </div>
      )}
    </div>
  );
}
