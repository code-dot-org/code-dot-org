import {Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import Alert from '@code-dot-org/component-library/alert';

import {fetchCertificateViewer, type CertificateViewer} from '@/api/viewer';
import {CertificateCanvasPreview} from '@/certificate/canvas/CertificateCanvasPreview';
import type {CertificateParams} from '@/certificate/model/certificateTypes';
import {encodeCertificateParams} from '@/routing/certificateParams';

import {useCertificateCourse} from '../api/useCertificateCourse';

import {CertificateBatchEditor} from './CertificateBatchEditor';
import styles from './certificateBatchPage.module.css';
import {CertificateBatchPrintView} from './CertificateBatchPrintView';

export function CertificateBatchPage({
  courseName = 'hourofcode',
}: {
  courseName?: string;
}) {
  const [names, setNames] = useState<readonly string[] | null>(null);
  const [viewer, setViewer] = useState<CertificateViewer | null>(null);
  const [viewerError, setViewerError] = useState(false);
  const {courseInfo, error: courseError} = useCertificateCourse(courseName);
  const previewParams = useMemo<CertificateParams>(
    () => ({course: courseName}),
    [courseName],
  );

  useEffect(() => {
    let cancelled = false;
    fetchCertificateViewer()
      .then(response => {
        if (!cancelled) {
          setViewer(response);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViewerError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const invalidCourse =
    courseInfo?.resolution === 'hour_of_code_fallback' &&
    courseName !== 'hourofcode';

  if (courseError || viewerError) {
    return (
      <Alert
        text="Something went wrong loading the certificate batch. Refresh to try again."
        type="danger"
      />
    );
  }

  if (invalidCourse) {
    return (
      <Alert
        text="This course cannot be used to print a certificate batch."
        type="danger"
      />
    );
  }

  if (viewer && !viewer.canBulkPrint) {
    return (
      <Alert
        text="You must be signed in as a teacher to bulk print certificates."
        type="danger"
      />
    );
  }

  if (names && courseInfo) {
    return (
      <CertificateBatchPrintView
        courseInfo={courseInfo}
        courseName={courseName}
        names={names}
      />
    );
  }

  const blankPrintHref = `/print_certificates/${encodeCertificateParams({
    course: courseName,
  })}`;

  return (
    <div className={styles.page}>
      <Typography gutterBottom variant="h1">
        Print a batch of certificates
      </Typography>
      <div className={styles.content}>
        <div className={styles.preview}>
          {courseInfo && (
            <CertificateCanvasPreview
              courseInfo={courseInfo}
              params={previewParams}
            />
          )}
          <Typography variant="body2">
            It is recommended that you choose <strong>Landscape</strong> when
            you print the certificates.
          </Typography>
        </div>
        {courseInfo && viewer && (
          <CertificateBatchEditor
            blankPrintHref={blankPrintHref}
            courseTitle={courseInfo.localizedTitle}
            onSubmit={setNames}
          />
        )}
      </div>
    </div>
  );
}
