import {Typography} from '@mui/material';
import {useMemo} from 'react';

import type {CertificateCompletionEntry} from '@/api/completion';
import {CertificateCanvasPreview} from '@/certificate/canvas/CertificateCanvasPreview';
import type {CertificateParams} from '@/certificate/model/certificateTypes';
import {encodeCertificateParams} from '@/routing/certificateParams';

import {useCourseInfo} from '../pages/useCourseInfo';

import styles from './certificateCongratsPage.module.css';

export function CongratsCertificate({
  entry,
  name,
}: {
  entry: CertificateCompletionEntry;
  name?: string;
}) {
  const {courseInfo} = useCourseInfo(entry.courseName);
  const sharePath = `/certificates/${encodeCertificateParams({
    course: entry.courseName,
    ...(name ? {name} : {}),
  })}`;
  const canvasParams = useMemo<CertificateParams>(
    () => ({course: entry.courseName, ...(name ? {name} : {})}),
    [entry.courseName, name],
  );

  if (!courseInfo) {
    return null;
  }

  return (
    <div>
      <Typography className={styles.subheading} variant="h2">
        {name && (
          <>
            <span data-notranslate>{name}</span>
            {' — '}
          </>
        )}
        {courseInfo.localizedTitle}
      </Typography>
      <a href={sharePath}>
        <CertificateCanvasPreview
          courseInfo={courseInfo}
          params={canvasParams}
        />
      </a>
    </div>
  );
}
