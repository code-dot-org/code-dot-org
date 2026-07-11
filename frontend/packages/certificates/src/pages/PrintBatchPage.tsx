import {Button, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {z} from 'zod';

import Alert from '@code-dot-org/component-library/alert';

import {exportCertificateBlob} from '@/certificate/canvas/exportCertificateCanvas';
import type {CertificateCourseInfo} from '@/certificate/model/certificateTypes';
import {loadTemplateImage} from '@/certificate/template/loadCertificateTemplate';
import {readShellCertificateData} from '@/lib/shellData';

import styles from './printBatchPage.module.css';
import '../print.css';
import {useCourseInfo} from './useCourseInfo';

// Server-side cap on POSTed studentNames; defended here too.
const MAX_BATCH_NAMES = 30;

const printBatchShellDataSchema = z.object({
  courseName: z.string(),
  studentNames: z.array(z.string()),
});

interface BatchCertificate {
  name: string;
  url: string;
}

/**
 * One certificate per name, rendered sequentially to JPEG object URLs rather
 * than holding 30 live canvases (iOS canvas-memory cap; design D1).
 */
function useBatchCertificateImages(
  courseInfo: CertificateCourseInfo | null,
  courseName: string,
  names: string[],
): {certificates: BatchCertificate[] | null; error: boolean} {
  const [certificates, setCertificates] = useState<BatchCertificate[] | null>(
    null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!courseInfo) {
      return;
    }

    let cancelled = false;
    const urls: string[] = [];

    (async () => {
      const templateImage = await loadTemplateImage(
        courseInfo.templateFilename,
      );
      const rendered: BatchCertificate[] = [];

      for (const name of names) {
        const blob = await exportCertificateBlob({
          courseInfo,
          mimeType: 'image/jpeg',
          params: {course: courseName, name},
          quality: 0.92,
          templateImage,
        });
        const url = URL.createObjectURL(blob);
        urls.push(url);
        rendered.push({name, url});
      }

      if (cancelled) {
        urls.forEach(url => URL.revokeObjectURL(url));
        return;
      }

      setCertificates(rendered);
    })().catch(() => {
      if (!cancelled) {
        setError(true);
      }
    });

    return () => {
      cancelled = true;
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [courseInfo, courseName, names]);

  return {certificates, error};
}

/** /print_certificates/batch — Rails-hydrated POST target; one page per name. */
export function CertificatePrintBatchPage() {
  const [shellData] = useState(
    () =>
      readShellCertificateData(printBatchShellDataSchema) ?? {
        courseName: 'hourofcode',
        studentNames: [],
      },
  );
  const [names] = useState(() =>
    (shellData.studentNames ?? [])
      .map(name => name.trim())
      .filter(Boolean)
      .slice(0, MAX_BATCH_NAMES),
  );
  const {courseInfo, error: courseInfoError} = useCourseInfo(
    shellData.courseName,
  );
  const {certificates, error: renderError} = useBatchCertificateImages(
    courseInfo,
    shellData.courseName,
    names,
  );

  return (
    <div className={styles.page}>
      <div className={styles.instructions}>
        <Typography gutterBottom variant="h1">
          Hour of Code Certificates
        </Typography>
        <Typography variant="body2">Ready to print?</Typography>
        <Typography variant="body2">
          Look at your certificates first to make sure they're correct before
          you waste a lot of paper.
        </Typography>
        <Typography variant="body2">
          <strong>IMPORTANT:</strong> Make sure you print in Landscape
          orientation (sideways, not regular), so the certificates fill a full
          page.
        </Typography>
        <Typography gutterBottom variant="body2">
          When you're ready...
        </Typography>
        <div>
          <Button onClick={() => window.print()} variant="contained">
            Print
          </Button>
        </div>
        {(courseInfoError || renderError) && (
          <Alert
            text="Something went wrong preparing the certificates. Refresh the page to try again."
            type="danger"
          />
        )}
        {!certificates && !courseInfoError && !renderError && (
          <Typography variant="body2">
            Preparing {names.length} certificate
            {names.length === 1 ? '' : 's'}...
          </Typography>
        )}
      </div>
      {certificates?.map(certificate => (
        <div className={styles.certificate} key={certificate.url}>
          <img
            alt={`Certificate for ${certificate.name}`}
            data-notranslate
            src={certificate.url}
          />
        </div>
      ))}
    </div>
  );
}
