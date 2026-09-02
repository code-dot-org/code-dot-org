import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  ChallengeResponse,
  challengeResponseListValidator,
  ChallengeResponseDetail,
  challengeResponseDetailValidator,
  GalleryUnit,
} from '@code-dot-org/lesson-deep-dive';
import {
  Typography,
  Button as MuiButton,
  IconButton as MuiIconButton,
} from '@mui/material';
import React, {FC, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import AssessmentPanel from './AssessmentPanel';
import ProjectDetailsCard from './ProjectDetailsCard';
import ProjectStage from './ProjectStage';

import styles from './project-view.module.scss';

interface ProjectViewProps {
  responseId: number;
  units: GalleryUnit[];
  // The gallery listing the viewer came from, in display order. Backs the
  // teacher's "N of M" navigation across projects; null while the gallery
  // itself is still loading (e.g. on a deep link).
  galleryResponses: ChallengeResponse[] | null;
  onBack: () => void;
  // Switch the page to another response (a version of this project, or the
  // teacher's previous/next project).
  onOpenProject: (id: number) => void;
}

// The Tutor+ project page: one submitted challenge project, its media and
// prompt, and — depending on the viewer — the AI assessment (teacher) or
// feedback (owner) side panel. Rendered inside the gallery page when a
// project is selected.
const ProjectView: FC<ProjectViewProps> = ({
  responseId,
  units,
  galleryResponses,
  onBack,
  onOpenProject,
}) => {
  const [detail, setDetail] = useState<ChallengeResponseDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // All of this student's submissions for the challenge, oldest first, for
  // the "response #N" switcher.
  const [versions, setVersions] = useState<ChallengeResponse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setLoadFailed(false);
    HttpClient.fetchJson<ChallengeResponseDetail>(
      `/challenge_responses/${responseId}`,
      {},
      challengeResponseDetailValidator
    )
      .then(({value}) => {
        if (!cancelled && value) {
          setDetail(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [responseId]);

  const challengeId = detail?.challenge_id;
  const studentId = detail?.user_id;
  useEffect(() => {
    if (challengeId === undefined || studentId === undefined) {
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({
      challenge_id: challengeId.toString(),
      user_id: studentId.toString(),
      sort: 'oldest',
    });
    HttpClient.fetchJson<ChallengeResponse[]>(
      `/challenge_responses?${params.toString()}`,
      {},
      challengeResponseListValidator
    )
      .then(({value}) => {
        if (!cancelled) {
          setVersions(value || []);
        }
      })
      .catch(() => {
        // Without the version list the switcher just shows this response.
      });
    return () => {
      cancelled = true;
    };
  }, [challengeId, studentId]);

  if (loadFailed) {
    return (
      <div className={styles.projectView}>
        <Typography variant="body3" className={styles.statusText}>
          We couldn&apos;t load this project. Try refreshing the page.
        </Typography>
      </div>
    );
  }
  if (!detail) {
    return (
      <div className={styles.projectView}>
        <Typography variant="body3" className={styles.statusText}>
          Loading project…
        </Typography>
      </div>
    );
  }

  const isTeacher = detail.viewer_role === 'teacher';
  const isOwner = detail.viewer_role === 'owner';

  const versionIndex = versions?.findIndex(v => v.id === detail.id) ?? -1;
  const previousVersion =
    versions && versionIndex > 0 ? versions[versionIndex - 1] : null;
  const nextVersion =
    versions && versionIndex >= 0 && versionIndex < versions.length - 1
      ? versions[versionIndex + 1]
      : null;

  // The teacher pages across the gallery's projects by student+challenge:
  // the gallery lists one card per student per challenge, but the response
  // on screen may be an older version, so match on those instead of id.
  const galleryIndex =
    galleryResponses?.findIndex(
      r =>
        r.user_id === detail.user_id && r.challenge_id === detail.challenge_id
    ) ?? -1;
  const previousProject =
    galleryResponses && galleryIndex > 0
      ? galleryResponses[galleryIndex - 1]
      : null;
  const nextProject =
    galleryResponses &&
    galleryIndex >= 0 &&
    galleryIndex < galleryResponses.length - 1
      ? galleryResponses[galleryIndex + 1]
      : null;

  const unit = units.find(u => u.id === detail.unit_id) ?? null;
  const respondAgainUrl =
    unit && detail.lesson_position !== null
      ? `${unit.link}/lessons/${detail.lesson_position}/tutor`
      : null;

  return (
    <div className={styles.projectView}>
      <div className={styles.topBar}>
        <div className={styles.topBarSide}>
          <MuiButton
            type="button"
            variant="outlined"
            color="secondary"
            size="extraSmall"
            onClick={onBack}
            startIcon={
              <FontAwesomeV6Icon
                iconName={isTeacher ? 'arrow-left' : 'gallery-thumbnails'}
              />
            }
          >
            {isTeacher ? 'Back to project gallery' : 'View project gallery'}
          </MuiButton>
        </div>
        <div className={styles.versionControls}>
          <MuiIconButton
            type="button"
            variant="text"
            color="secondary"
            size="extraSmall"
            disabled={!previousVersion}
            onClick={() => previousVersion && onOpenProject(previousVersion.id)}
            aria-label="Previous response"
          >
            <FontAwesomeV6Icon iconName="angle-left" />
          </MuiIconButton>
          <Typography
            variant="overline2"
            component="span"
            className={styles.versionLabel}
          >
            {`Response #${versionIndex >= 0 ? versionIndex + 1 : 1}`}
          </Typography>
          <MuiIconButton
            type="button"
            variant="text"
            color="secondary"
            size="extraSmall"
            disabled={!nextVersion}
            onClick={() => nextVersion && onOpenProject(nextVersion.id)}
            aria-label="Next response"
          >
            <FontAwesomeV6Icon iconName="angle-right" />
          </MuiIconButton>
        </div>
        <div className={styles.topBarSide}>
          {isTeacher && galleryIndex >= 0 && galleryResponses && (
            <>
              <Typography
                variant="body4"
                component="span"
                className={styles.projectCount}
              >
                {galleryIndex + 1} of {galleryResponses.length}
              </Typography>
              <MuiButton
                type="button"
                variant="outlined"
                color="secondary"
                size="extraSmall"
                disabled={!previousProject}
                onClick={() =>
                  previousProject && onOpenProject(previousProject.id)
                }
              >
                Previous
              </MuiButton>
              <MuiButton
                type="button"
                variant="outlined"
                color="secondary"
                size="extraSmall"
                disabled={!nextProject}
                onClick={() => nextProject && onOpenProject(nextProject.id)}
              >
                Next
              </MuiButton>
            </>
          )}
          {isOwner && respondAgainUrl && (
            <MuiButton
              variant="outlined"
              color="secondary"
              size="extraSmall"
              href={respondAgainUrl}
            >
              Respond again
            </MuiButton>
          )}
        </div>
      </div>
      <div className={styles.contentRow}>
        {detail.viewer_role !== 'peer' && <AssessmentPanel detail={detail} />}
        <div className={styles.stage}>
          <ProjectStage detail={detail} />
          <ProjectDetailsCard
            detail={detail}
            unitPosition={unit?.position ?? null}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
