import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {personalizeHocCertificate} from '@/api/personalization';
import {fetchCertificateViewer, type CertificateViewer} from '@/api/viewer';
import {CertificateCanvasPreview} from '@/certificate/canvas/CertificateCanvasPreview';
import {exportCertificateBlob} from '@/certificate/canvas/exportCertificateCanvas';
import type {CertificateParams} from '@/certificate/model/certificateTypes';
import {loadTemplateImage} from '@/certificate/template/loadCertificateTemplate';
import {
  decodeCertificateParams,
  encodeCertificateParams,
} from '@/routing/certificateParams';
import {SocialShareButtons} from '@/sharing/SocialShareButtons';

import {useCertificateCourse} from '../api/useCertificateCourse';
import {BackToFrontConfetti} from '../personalization/BackToFrontConfetti';
import {NameRequiredAlert} from '../personalization/NameRequiredAlert';
import {PersonalizeForm} from '../personalization/PersonalizeForm';

import '../print/certificatePrint.css';
import styles from './certificateSharePage.module.css';

export interface CertificateSharePageProps {
  /** Absent on /certificates/blank, which shows the Hour of Code certificate. */
  encodedParams?: string;
  /** HOC tracking session (`?i=`); HOC personalization PATCHes when present. */
  sessionId?: string;
}

interface ViewerState {
  data: CertificateViewer | null;
  loaded: boolean;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  });
}

export function CertificateSharePage({
  encodedParams,
  sessionId,
}: CertificateSharePageProps) {
  const decodedParams = useMemo<CertificateParams | null>(() => {
    if (!encodedParams) {
      return {course: 'hourofcode'};
    }

    try {
      return decodeCertificateParams(encodedParams);
    } catch {
      return null;
    }
  }, [encodedParams]);

  const {courseInfo, error: courseInfoError} = useCertificateCourse(
    decodedParams?.course ?? null,
  );
  const [viewer, setViewer] = useState<ViewerState>({
    data: null,
    loaded: false,
  });
  const [personalizedName, setPersonalizedName] = useState<string>();
  const [manuallyPersonalized, setManuallyPersonalized] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [templateImageElement, setTemplateImageElement] =
    useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCertificateViewer()
      .then(data => {
        if (!cancelled) {
          setViewer({data, loaded: true});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViewer({data: null, loaded: true});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isPlCourse = courseInfo?.courseKind === 'pl';
  const isHocTutorial = courseInfo?.courseKind === 'hoc';
  const certificateName = viewer.data?.certificateName ?? undefined;
  const nameRequired = isPlCourse && viewer.loaded && !certificateName;
  // PL certificates always use the account name (no manual input).
  const personalized =
    manuallyPersonalized || (isPlCourse && !!certificateName);

  const displayName = isPlCourse
    ? certificateName
    : (personalizedName ?? decodedParams?.name);
  const renderParams = useMemo<CertificateParams | null>(
    () =>
      decodedParams
        ? {
            course: decodedParams.course,
            ...(displayName ? {name: displayName} : {}),
          }
        : null,
    [decodedParams, displayName],
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

  const personalize = async (name: string) => {
    if (!sessionId || !isHocTutorial) {
      setPersonalizedName(name);
      setManuallyPersonalized(true);
      return;
    }

    try {
      const response = await personalizeHocCertificate(sessionId, name);
      if (response.certificate_sent) {
        setPersonalizedName(response.name ?? name);
        setManuallyPersonalized(true);
      }
    } catch {
      setActionError(true);
    }
  };

  const exportJpeg = async (params: CertificateParams): Promise<Blob> => {
    if (!courseInfo) {
      throw new Error('Certificate is not ready to export');
    }

    const templateImage =
      templateImageElement && templateImageElement.naturalWidth > 0
        ? templateImageElement
        : await loadTemplateImage(courseInfo.templateFilename);
    return exportCertificateBlob({
      courseInfo,
      mimeType: 'image/jpeg',
      params,
      quality: 0.9,
      templateImage,
    });
  };

  // Browser analytics waits for shared core support: code-dot-org/code-dot-org#73791.
  const handleDownload = async () => {
    if (!renderParams) {
      return;
    }

    try {
      const blob = await exportJpeg(renderParams);
      downloadBlob(blob, `${encodeCertificateParams(renderParams)}.jpg`);
    } catch {
      setActionError(true);
    }
  };

  const handleShare = async () => {
    if (!renderParams) {
      return;
    }

    try {
      const blob = await exportJpeg(renderParams);
      const file = new File([blob], 'certificate.jpg', {type: 'image/jpeg'});

      if (navigator.canShare?.({files: [file]})) {
        await navigator.share({files: [file]}).catch(() => undefined);
      } else {
        downloadBlob(blob, `${encodeCertificateParams(renderParams)}.jpg`);
      }
    } catch {
      setActionError(true);
    }
  };

  const shareParams: CertificateParams = {
    course: decodedParams.course,
    ...(displayName ? {name: displayName} : {}),
  };
  const shareUrl = `${window.location.origin}/certificates/${encodeCertificateParams(shareParams)}`;
  const actionsDisabled = !courseInfo || nameRequired;

  return (
    <div className={styles.page}>
      <Typography gutterBottom variant="h1">
        You Earned a Certificate of Completion
      </Typography>
      {(courseInfoError || actionError) && (
        <Alert
          onClose={() => setActionError(false)}
          text="Something went wrong loading this certificate. Refresh the page to try again."
          type="danger"
        />
      )}
      {nameRequired && <NameRequiredAlert />}
      {courseInfo && (
        <Typography className={styles.subheading} variant="h2">
          {displayName && (
            <>
              <span data-notranslate>{displayName}</span>
              {' — '}
            </>
          )}
          {courseInfo.localizedTitle}
        </Typography>
      )}
      <div className={styles.content}>
        <div className={styles.certificate}>
          <BackToFrontConfetti active={personalized} />
          {courseInfo && (
            <CertificateCanvasPreview
              courseInfo={courseInfo}
              params={renderParams ?? decodedParams}
              templateImageRef={setTemplateImageElement}
            />
          )}
        </div>
        <div className={styles.actions}>
          {!isPlCourse && (
            <>
              <PersonalizeForm
                onSubmit={personalize}
                personalized={personalized}
              />
              <hr />
            </>
          )}
          <div className={styles.buttonRow}>
            <Button
              disabled={actionsDisabled}
              onClick={handleDownload}
              startIcon={<FontAwesomeV6Icon iconName="download" />}
              variant="contained"
            >
              Download
            </Button>
            <Button
              disabled={actionsDisabled}
              onClick={handleShare}
              startIcon={<FontAwesomeV6Icon iconName="share-nodes" />}
              variant="outlined"
            >
              Share
            </Button>
          </div>
          <Typography gutterBottom variant="h3">
            Share your achievement
          </Typography>
          <Typography gutterBottom variant="body2">
            Share your achievement with others and encourage them to
            participate.
          </Typography>
          {viewer.loaded && viewer.data && !nameRequired && (
            <SocialShareButtons
              allowedShareTargets={viewer.data.allowedShareTargets}
              isProfessionalLearning={isPlCourse}
              onPrint={() => window.print()}
              shareUrl={shareUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}
