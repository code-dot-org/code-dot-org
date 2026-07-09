import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './prepare-list.module.scss';

interface SuggestedLesson {
  lesson_id?: number;
  name?: string;
  url?: string;
  podcast_url?: string;
  completed_unit?: boolean;
}

type AudioStatus = 'loading' | 'ready' | 'unavailable';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SectionPodcastCardProps {
  sectionId: number;
  sectionName: string;
}

const SectionPodcastCard: React.FC<SectionPodcastCardProps> = ({
  sectionId,
  sectionName,
}) => {
  const [lesson, setLesson] = useState<SuggestedLesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('loading');

  useEffect(() => {
    HttpClient.fetchJson<SuggestedLesson | null>(
      `/api/v1/sections/${sectionId}/suggested_lesson`
    )
      .then(response => {
        setLesson(response?.value ?? null);
        setLessonLoading(false);
      })
      .catch(() => {
        setLesson(null);
        setLessonLoading(false);
      });
  }, [sectionId]);

  // Reset playback state when the suggested lesson changes.
  useEffect(() => {
    setAudioStatus('loading');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [lesson?.lesson_id]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(p => !p);
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audioRef.current && duration) {
        audioRef.current.currentTime = pct * duration;
      }
    },
    [duration]
  );

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (lessonLoading) {
    return (
      <div className={styles.card}>
        <span className={styles.cardTitle}>{sectionName}</span>
      </div>
    );
  }

  if (!lesson?.lesson_id) {
    return (
      <div className={styles.card}>
        <span className={styles.cardTitle}>{sectionName}</span>
        <span className={styles.cardSubtitle}>No suggested lesson.</span>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className={styles.cardTitle}>{sectionName}</span>
      {lesson.name && (
        <span className={styles.cardSubtitle}>{lesson.name}</span>
      )}
      <audio
        ref={audioRef}
        src={lesson.podcast_url}
        preload="auto"
        onCanPlay={() => setAudioStatus('ready')}
        onError={() => setAudioStatus('unavailable')}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onEnded={() => setIsPlaying(false)}
      >
        <track
          kind="captions"
          label="English captions"
          src=""
          srcLang="en"
          default
        />
      </audio>
      {audioStatus === 'unavailable' ? (
        <span className={styles.unavailable}>Podcast not yet available.</span>
      ) : (
        <div className={styles.player}>
          <div
            className={styles.progressTrack}
            onClick={handleProgressClick}
            role="slider"
            tabIndex={0}
            aria-label="Playback position"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
          >
            <div
              className={styles.progressFill}
              style={{width: `${progress}%`}}
            />
          </div>
          <div className={styles.playerRow}>
            <span className={styles.timestamp}>{formatTime(currentTime)}</span>
            <button
              type="button"
              className={styles.playButton}
              onClick={togglePlay}
              disabled={audioStatus !== 'ready'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <FontAwesomeV6Icon iconName={isPlaying ? 'pause' : 'play'} />
            </button>
            <span className={styles.timestamp}>
              {duration ? formatTime(duration) : '--:--'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionPodcastCard;
