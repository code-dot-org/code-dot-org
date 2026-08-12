import React, {FC, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  Challenge,
  ChallengeResponse,
  ChallengeResponseAsset,
  challengeResponseListValidator,
  challengeValidator,
} from '../lessonDeepDive/types';

import styles from './challenge-gallery.module.scss';

interface ChallengeGalleryProps {
  lessonId: number;
  lessonName: string;
}

// Bare-bones gallery of the student's submitted challenge work for one
// lesson: each final submission is shown with its assets (whiteboard image,
// video, or audio), any text/transcript, and the AI feedback once evaluation
// has completed. No design exists for this page yet; the layout here is a
// placeholder so the data flow can be exercised end to end.
const ChallengeGallery: FC<ChallengeGalleryProps> = ({
  lessonId,
  lessonName,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [responses, setResponses] = useState<ChallengeResponse[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({
      lesson_id: lessonId.toString(),
    }).toString();
    Promise.all([
      HttpClient.fetchJson<Challenge[]>(
        `/challenges?${query}`,
        {},
        challengeValidator
      ),
      HttpClient.fetchJson<ChallengeResponse[]>(
        `/challenge_responses?${query}`,
        {},
        challengeResponseListValidator
      ),
    ])
      .then(([challengeResult, responseResult]) => {
        if (cancelled) {
          return;
        }
        setChallenges(challengeResult.value || []);
        setResponses(responseResult.value || []);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const questionFor = (challengeId: number) =>
    challenges.find(c => c.id === challengeId)?.question || null;

  const feedbackMessage = (response: ChallengeResponse) => {
    if (response.student_feedback) {
      return response.student_feedback;
    }
    if (
      response.evaluation_status === 'queued' ||
      response.evaluation_status === 'running'
    ) {
      return 'Feedback is on its way. Check back soon!';
    }
    return 'Feedback is not available for this submission.';
  };

  const renderAsset = (asset: ChallengeResponseAsset) => {
    if (!asset.download_url) {
      return null;
    }
    switch (asset.asset_type) {
      case 'whiteboard_image':
        return (
          <img
            key={asset.id}
            className={styles.assetImage}
            src={asset.download_url}
            alt="Whiteboard submission"
          />
        );
      case 'video':
        return (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- student recordings have no caption track
          <video
            key={asset.id}
            className={styles.assetVideo}
            src={asset.download_url}
            controls
          />
        );
      case 'audio':
        return (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- student recordings have no caption track
          <audio key={asset.id} src={asset.download_url} controls />
        );
      default:
        return null;
    }
  };

  const renderBody = () => {
    if (loadFailed) {
      return (
        <p className={styles.statusText}>
          We couldn&apos;t load your challenge submissions. Try refreshing the
          page.
        </p>
      );
    }
    if (responses === null) {
      return <p className={styles.statusText}>Loading your submissions…</p>;
    }
    if (responses.length === 0) {
      return (
        <p className={styles.statusText}>
          You haven&apos;t submitted any challenge responses for this lesson
          yet.
        </p>
      );
    }
    return responses.map(response => {
      const question = questionFor(response.challenge_id);
      return (
        <section key={response.id} className={styles.responseCard}>
          {question && <h2 className={styles.question}>{question}</h2>}
          <p className={styles.submittedAt}>
            Submitted {new Date(response.created_at).toLocaleString()}
          </p>
          <div className={styles.assets}>
            {response.assets.map(renderAsset)}
          </div>
          {response.student_text && (
            <div className={styles.textBlock}>
              <h3 className={styles.blockHeading}>Your response</h3>
              <p className={styles.blockText}>{response.student_text}</p>
            </div>
          )}
          {response.transcript && (
            <div className={styles.textBlock}>
              <h3 className={styles.blockHeading}>Transcript</h3>
              <p className={styles.blockText}>{response.transcript}</p>
            </div>
          )}
          <div className={styles.feedbackBlock}>
            <h3 className={styles.blockHeading}>Feedback</h3>
            <p className={styles.blockText}>{feedbackMessage(response)}</p>
          </div>
        </section>
      );
    });
  };

  return (
    <div className={styles.gallery}>
      <h1 className={styles.pageHeading}>{lessonName}: Challenge Gallery</h1>
      {renderBody()}
    </div>
  );
};

export default ChallengeGallery;
