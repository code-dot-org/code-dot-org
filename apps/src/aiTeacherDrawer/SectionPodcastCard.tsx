import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {SectionAvatar} from '@code-dot-org/teacher-dashboard/home';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import styles from './prepare-list.module.scss';

export interface SuggestedLesson {
  lesson_id?: number;
  name?: string;
  url?: string;
  podcast_url?: string | null;
  completed_unit?: boolean;
}

type AudioStatus = 'loading' | 'ready' | 'unavailable';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SectionPodcastCardProps {
  sectionName: string;
  avatarColor: number;
  avatarEmoji: number;
  // undefined = suggested_lessons fetch still in flight
  lesson: SuggestedLesson | null | undefined;
}

const SectionPodcastCard: React.FC<SectionPodcastCardProps> = ({
  sectionName,
  avatarColor,
  avatarEmoji,
  lesson,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('loading');

  useEffect(() => {
    setAudioStatus(lesson?.podcast_url ? 'loading' : 'unavailable');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsCompleted(false);
  }, [lesson?.lesson_id, lesson?.podcast_url]);

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
      const pct = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      if (audioRef.current && duration) {
        const newTime = pct * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // podcast_url is server-verified: truthy means the file exists in S3.
  // Render the podcast row immediately (play button disabled until canplay)
  // so there is no layout shift when audio becomes ready.
  const hasPodcast = !!lesson?.podcast_url;

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionRow}>
        <SectionAvatar color={avatarColor} emoji={avatarEmoji} size="xs" />
        <span className={styles.sectionName}>{sectionName}</span>
        <FontAwesomeV6Icon iconName="chevron-right" />
      </div>
      {hasPodcast && (
        <div className={styles.podcastRow}>
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
            {formatTime(currentTime)} /{' '}
            {duration ? formatTime(duration) : '--:--'}
          </span>
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
          {isCompleted && (
            <span className={styles.completedIcon}>
              <FontAwesomeV6Icon iconName="circle-check" />
            </span>
          )}
          <audio
            ref={audioRef}
            src={lesson.podcast_url!}
            preload="auto"
            onCanPlay={() => setAudioStatus('ready')}
            onError={() => setAudioStatus('unavailable')}
            onDurationChange={() =>
              setDuration(audioRef.current?.duration || 0)
            }
            onTimeUpdate={() =>
              setCurrentTime(audioRef.current?.currentTime || 0)
            }
            onEnded={() => {
              setIsPlaying(false);
              setIsCompleted(true);
            }}
          >
            <track
              kind="captions"
              label="English captions"
              src=""
              srcLang="en"
              default
            />
          </audio>
        </div>
      )}
    </div>
  );
};

export default SectionPodcastCard;
