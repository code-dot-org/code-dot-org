import {Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import Carousel from '@code-dot-org/component-library/carousel';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  fetchCertificateCompletion,
  type CertificateCompletion,
} from '@/api/completion';
import {personalizeHocCertificate} from '@/api/personalization';
import {fetchCertificateViewer, type CertificateViewer} from '@/api/viewer';
import {encodeCertificateParams} from '@/routing/certificateParams';
import {SocialShareButtons} from '@/sharing/SocialShareButtons';

import {BackToFrontConfetti} from '../personalization/BackToFrontConfetti';
import {NameRequiredAlert} from '../personalization/NameRequiredAlert';
import {PersonalizeForm} from '../personalization/PersonalizeForm';

import styles from './certificateCongratsPage.module.css';
import {CertificateRecommendations} from './CertificateRecommendations';
import {CongratsCertificate} from './CongratsCertificate';

export interface CertificateCongratsPageProps {
  encodedCourse?: string;
  sessionId?: string;
}

function recommendationHeading(
  courseKind: CertificateCompletion['courseKind'],
): string {
  if (courseKind === 'hour_of_code') {
    return 'Continue Beyond an Hour of AI';
  }
  if (courseKind.startsWith('professional_learning')) {
    return 'Discover facilitator-led workshops';
  }
  return 'Graduate to the next level';
}

export function CertificateCongratsPage({
  encodedCourse,
  sessionId,
}: CertificateCongratsPageProps) {
  const [completion, setCompletion] = useState<CertificateCompletion | null>(
    null,
  );
  const [viewer, setViewer] = useState<CertificateViewer | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [personalizedName, setPersonalizedName] = useState<string>();
  const [manuallyPersonalized, setManuallyPersonalized] = useState(false);
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchCertificateCompletion(encodedCourse),
      fetchCertificateViewer(),
    ])
      .then(([completionResponse, viewerResponse]) => {
        if (!cancelled) {
          setCompletion(completionResponse);
          setViewer(viewerResponse);
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
  }, [encodedCourse]);

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

  if (!completion || !viewer) {
    return (
      <div className={styles.page}>
        <Typography variant="body2">Loading...</Typography>
      </div>
    );
  }

  if (completion.certificates.length === 0) {
    return (
      <div className={styles.page}>
        <Typography variant="h3">
          You must complete the course to earn a certificate. Return to the
          course and keep working.
        </Typography>
      </div>
    );
  }

  const isProfessionalLearning = completion.courseKind.startsWith(
    'professional_learning',
  );
  const certificateName = viewer.certificateName ?? undefined;
  const nameRequired = isProfessionalLearning && !certificateName;
  const personalized =
    manuallyPersonalized || (isProfessionalLearning && !!certificateName);
  const displayName = isProfessionalLearning
    ? certificateName
    : personalizedName;
  const primaryCertificate = completion.certificates[0];
  const shareParams = {
    course: primaryCertificate.courseName,
    ...(displayName ? {name: displayName} : {}),
  };
  const encodedShareParams = encodeCertificateParams(shareParams);

  const personalize = async (name: string) => {
    if (!sessionId || completion.courseKind !== 'hour_of_code') {
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
          {completion.certificates.length === 1 ? (
            <CongratsCertificate
              entry={primaryCertificate}
              name={displayName}
            />
          ) : (
            <Carousel
              slides={completion.certificates.map(entry => ({
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
          {!isProfessionalLearning && (
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
              allowedShareTargets={viewer.allowedShareTargets}
              isProfessionalLearning={isProfessionalLearning}
              printHref={`/print_certificates/${encodedShareParams}`}
              shareUrl={`${window.location.origin}/certificates/${encodedShareParams}`}
            />
          )}
        </div>
      </div>
      {completion.recommendations.length > 0 && (
        <section className={styles.section}>
          <Typography gutterBottom variant="h2">
            {recommendationHeading(completion.courseKind)}
          </Typography>
          <CertificateRecommendations
            recommendations={completion.recommendations}
          />
        </section>
      )}
    </div>
  );
}
