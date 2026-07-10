import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {CertificateCanvasPreview} from '@/components/CertificateCanvasPreview';
import {ANALYTICS_EVENTS, sendAnalyticsEvent} from '@/lib/analytics';
import {fetchCertificateUserInfo, personalizeHocCertificate} from '@/lib/api';
import {decodeCertificateParams, encodeCertificateParams} from '@/lib/base64';
import {exportCertificateBlob} from '@/lib/exportCanvas';
import {loadTemplateImage} from '@/lib/templateImage';
import type {CertificateParams, CertificateUserInfo} from '@/lib/types';

import {BackToFrontConfetti} from './BackToFrontConfetti';
import {NameRequiredAlert} from './NameRequiredAlert';
import {PersonalizeForm} from './PersonalizeForm';
import styles from './sharePage.module.css';
import '../print.css';
import {SocialShareButtons} from './SocialShareButtons';
import {useCourseInfo} from './useCourseInfo';

export interface CertificateSharePageProps {
  /** Absent on /certificates/blank, which shows the Hour of Code certificate. */
  encodedParams?: string;
  /** HOC tracking session (`?i=`); HOC personalization PATCHes when present. */
  sessionId?: string;
}

interface UserState {
  data: CertificateUserInfo | null;
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

  const {courseInfo, error: courseInfoError} = useCourseInfo(
    decodedParams?.course ?? null,
  );
  const [user, setUser] = useState<UserState>({data: null, loaded: false});
  const [personalizedName, setPersonalizedName] = useState<string>();
  const [manuallyPersonalized, setManuallyPersonalized] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [templateImageElement, setTemplateImageElement] =
    useState<HTMLImageElement | null>(null);

  // User fields gate social buttons and the PL account-name rule. The private
  // response also supplies the CSRF token omitted from cacheable shells.
  useEffect(() => {
    let cancelled = false;
    fetchCertificateUserInfo()
      .then(data => {
        if (!cancelled) {
          setUser({data, loaded: true});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser({data: null, loaded: true});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isPlCourse = courseInfo?.courseType === 'pl';
  const isHocTutorial = courseInfo?.courseType === 'hoc';
  const userName = user.data?.userName ?? undefined;
  const nameRequired = isPlCourse && user.loaded && !userName;
  // PL certificates always use the account name (no manual input).
  const personalized = manuallyPersonalized || (isPlCourse && !!userName);

  const displayName = isPlCourse
    ? userName
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
      if (!user.data?.csrfToken) {
        throw new Error('Certificate personalization requires a CSRF token');
      }

      const response = await personalizeHocCertificate(
        sessionId,
        name,
        user.data.csrfToken,
      );
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

  const handleDownload = async () => {
    if (!renderParams) {
      return;
    }

    try {
      const blob = await exportJpeg(renderParams);
      downloadBlob(blob, `${encodeCertificateParams(renderParams)}.jpg`);
      sendAnalyticsEvent(ANALYTICS_EVENTS.CERTIFICATE_DOWNLOADED);
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

      sendAnalyticsEvent(ANALYTICS_EVENTS.CERTIFICATE_SHARED, {
        platform: 'web-share',
      });
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
          {user.loaded && user.data && !nameRequired && (
            <SocialShareButtons
              isPlCourse={isPlCourse}
              onPrint={() => window.print()}
              shareUrl={shareUrl}
              under13={user.data.under13}
              userType={user.data.userType}
            />
          )}
        </div>
      </div>
    </div>
  );
}
