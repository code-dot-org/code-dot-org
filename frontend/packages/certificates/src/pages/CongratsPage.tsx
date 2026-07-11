import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import Carousel from '@code-dot-org/component-library/carousel';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {personalizeHocCertificate} from '@/api/personalization';
import {CertificateCanvasPreview} from '@/certificate/canvas/CertificateCanvasPreview';
import type {
  CertificateCongratsEntry,
  CertificateCongratsResponse,
  CertificateParams,
} from '@/certificate/model/certificateTypes';
import {fetchCongrats} from '@/lib/api';
import {encodeCertificateParams} from '@/routing/certificateParams';

import {BackToFrontConfetti} from './BackToFrontConfetti';
import styles from './congratsPage.module.css';
import {NameRequiredAlert} from './NameRequiredAlert';
import {PersonalizeForm} from './PersonalizeForm';
import {SocialShareButtons} from './SocialShareButtons';
import {useCourseInfo} from './useCourseInfo';

export interface CertificateCongratsPageProps {
  /** Base64-encoded course name (`?s=`). */
  s?: string;
  /** HOC tracking session (`?i=`); drives server-side personalization. */
  sessionId?: string;
}

function CongratsCertificate({
  entry,
  name,
}: {
  entry: CertificateCongratsEntry;
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

/** /congrats — renders only what the entitlement API grants. */
export function CertificateCongratsPage({
  s,
  sessionId,
}: CertificateCongratsPageProps) {
  const [data, setData] = useState<CertificateCongratsResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [personalizedName, setPersonalizedName] = useState<string>();
  const [manuallyPersonalized, setManuallyPersonalized] = useState(false);
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCongrats(s)
      .then(response => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [s]);

  const userName = data?.userName ?? undefined;
  const isPlCourse = data?.isPlCourse ?? false;
  const nameRequired = !!data && isPlCourse && !userName;
  // PL certificates always use the account name (no manual input).
  const personalized = manuallyPersonalized || (isPlCourse && !!userName);

  if (loadError) {
    return (
      <div className={styles.page}>
        <Alert
          text="Something went wrong loading this page. Refresh to try again."
          type="danger"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <Typography variant="body2">Loading...</Typography>
      </div>
    );
  }

  if (data.certificates.length === 0) {
    return (
      <div className={styles.page}>
        <Typography variant="h3">
          You must complete the course to earn a certificate. Return to the
          course and keep working.
        </Typography>
      </div>
    );
  }

  const displayName = isPlCourse ? userName : personalizedName;
  const primaryCertificate = data.certificates[0];
  const shareParams = {
    course: primaryCertificate.courseName,
    ...(displayName ? {name: displayName} : {}),
  };
  const shareUrl = `${window.location.origin}/certificates/${encodeCertificateParams(shareParams)}`;
  const printHref = `/print_certificates/${encodeCertificateParams(shareParams)}`;

  const personalize = async (name: string) => {
    if (!(data.isHocTutorial && sessionId)) {
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

  const suggestion =
    data.assignableCourseSuggestions?.length === 1
      ? data.assignableCourseSuggestions[0]
      : null;
  const showNextCourse =
    !data.isHocTutorial &&
    !isPlCourse &&
    !!data.nextCourseScriptName &&
    !!data.nextCourseTitle;

  return (
    <div className={styles.page}>
      <Typography gutterBottom variant="h1">
        You Earned a Certificate of Completion
      </Typography>
      <a className={styles.backLink} href={primaryCertificate.coursePath}>
        <FontAwesomeV6Icon iconName="chevron-left" /> Back to activity
      </a>
      {actionError && (
        <Alert
          onClose={() => setActionError(false)}
          text="Something went wrong. Try again."
          type="danger"
        />
      )}
      {nameRequired && <NameRequiredAlert />}
      <div className={styles.content}>
        <div className={styles.certificates}>
          <BackToFrontConfetti active={personalized} />
          {data.certificates.length === 1 ? (
            <CongratsCertificate
              entry={primaryCertificate}
              name={displayName}
            />
          ) : (
            <Carousel
              slides={data.certificates.map(entry => ({
                id: entry.courseName,
                slide: (
                  <CongratsCertificate
                    entry={entry}
                    key={entry.courseName}
                    name={displayName}
                  />
                ),
              }))}
              slidesPerGroup={1}
              slidesPerView={1}
            />
          )}
        </div>
        <div className={styles.panel}>
          {!isPlCourse && (
            <>
              <PersonalizeForm
                onSubmit={personalize}
                personalized={personalized}
              />
              <hr />
            </>
          )}
          <Typography gutterBottom variant="h3">
            Share your achievement
          </Typography>
          <Typography gutterBottom variant="body2">
            Share your achievement with others and encourage them to
            participate.
          </Typography>
          {!nameRequired && (
            <SocialShareButtons
              isPlCourse={isPlCourse}
              printHref={printHref}
              shareUrl={shareUrl}
              under13={data.under13}
              userType={data.userType}
            />
          )}
        </div>
      </div>
      {suggestion && (
        <section className={styles.section}>
          <Typography gutterBottom variant="h2">
            Start teaching {suggestion.display_name}!
          </Typography>
          <Typography gutterBottom variant="body2">
            Congratulations! You're ready to start teaching your students.
          </Typography>
          <div className={styles.card}>
            {suggestion.image && <img alt="" src={suggestion.image} />}
            <div>
              <Typography gutterBottom variant="h3">
                {suggestion.display_name}
              </Typography>
              {suggestion.description && (
                <Typography gutterBottom variant="body2">
                  {suggestion.description}
                </Typography>
              )}
              <Button
                href={suggestion.course_version_path ?? '/catalog'}
                variant="contained"
              >
                View in the curriculum catalog
              </Button>
            </div>
          </div>
        </section>
      )}
      {showNextCourse && (
        <section className={styles.section}>
          <Typography gutterBottom variant="h2">
            Graduate to the next level
          </Typography>
          <div className={styles.card}>
            <div>
              <Typography gutterBottom variant="h3">
                {data.nextCourseTitle}
              </Typography>
              {data.nextCourseDescription && (
                <Typography gutterBottom variant="body2">
                  {data.nextCourseDescription}
                </Typography>
              )}
              <Button
                href={`/s/${data.nextCourseScriptName}`}
                variant="contained"
              >
                Start course
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
