import {Button, Typography} from '@mui/material';
import {useMemo, useState} from 'react';
import {z} from 'zod';

import {CertificateCanvasPreview} from '@/components/CertificateCanvasPreview';
import {encodeCertificateParams} from '@/lib/base64';
import {readShellCertificateData} from '@/lib/shellData';
import type {CertificateParams} from '@/lib/types';

import styles from './batchPage.module.css';
import {useCourseInfo} from './useCourseInfo';

const batchShellDataSchema = z.object({
  courseName: z.string(),
  courseTitle: z.string(),
  studentNames: z.array(z.string()),
});

function AuthenticityTokenInput() {
  const token =
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.content ?? '';

  return <input name="authenticity_token" type="hidden" value={token} />;
}

/**
 * /certificates/batch — teacher bulk-print editor. Rails hydrates the posted
 * names into the shell; submission stays a real form POST to
 * /print_certificates/batch (legacy CertificateBatch.jsx semantics).
 */
export function CertificateBatchPage() {
  const [shellData] = useState(
    () =>
      readShellCertificateData(batchShellDataSchema) ?? {
        courseName: 'hourofcode',
        courseTitle: 'Hour of Code',
        studentNames: [],
      },
  );
  const [studentNames, setStudentNames] = useState(() =>
    (shellData.studentNames ?? []).join('\n'),
  );
  const {courseInfo} = useCourseInfo(shellData.courseName);
  const previewParams = useMemo<CertificateParams>(
    () => ({course: shellData.courseName}),
    [shellData.courseName],
  );
  const blankPrintHref = `/print_certificates/${encodeCertificateParams({
    course: shellData.courseName,
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
        <div className={styles.editor}>
          <Typography gutterBottom variant="h3">
            Create Your Certificates
          </Typography>
          <Typography gutterBottom variant="body2">
            Enter up to 30 names, <strong>one per line</strong>. A printable
            page with personalized {shellData.courseTitle} certificates will be
            generated.
          </Typography>
          <form action="/print_certificates/batch" method="post">
            <AuthenticityTokenInput />
            <input
              name="courseName"
              type="hidden"
              value={shellData.courseName}
            />
            <textarea
              aria-label="Student names"
              className={styles.textarea}
              data-notranslate
              name="studentNames"
              onChange={event => setStudentNames(event.target.value)}
              placeholder="John Smith"
              rows={8}
              value={studentNames}
            />
            <div>
              <Button type="submit" variant="contained">
                Generate Certificates
              </Button>
            </div>
            <hr />
            <Typography variant="body2">
              Want a blank certificate template to write in your students'
              names? <a href={blankPrintHref}>Print one here.</a>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  );
}
