import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {ReflectionData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import Waveform from './Waveform';

import styles from './podcasts-box.module.scss';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface PodcastsBoxProps {
  lessonId: number;
  reflectionData: ReflectionData | null;
}

type PodcastStatus = 'loading' | 'ready' | 'unavailable';

// One line of the podcast transcript: who is speaking and what they say.
type ScriptLine = {voice_id: string; text: string};

const PodcastsBox: FC<PodcastsBoxProps> = ({lessonId, reflectionData}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<PodcastStatus>('loading');
  const [scriptLines, setScriptLines] = useState<ScriptLine[] | null>(null);
  // The analyser feeds the live Waveform. It's created lazily on first play
  // (an AudioContext must start from a user gesture), and stays null if Web
  // Audio is unavailable, in which case Waveform falls back to its CSS pulse.
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Routes the audio element through an AnalyserNode once. createMediaElement-
  // Source can only wrap an element a single time, so this is guarded by the
  // analyser already existing. The blob object URL is same-origin, so the
  // analyser reads real samples (a cross-origin source would read silence).
  const setupAnalyser = useCallback(() => {
    if (analyser || !audioRef.current || !window.AudioContext) {
      return;
    }
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audioRef.current);
      const node = ctx.createAnalyser();
      node.fftSize = 64;
      node.smoothingTimeConstant = 0.7;
      source.connect(node);
      node.connect(ctx.destination);
      audioCtxRef.current = ctx;
      setAnalyser(node);
    } catch {
      // Web Audio unavailable; Waveform keeps its decorative animation.
    }
  }, [analyser]);

  // Release the AudioContext when the component goes away.
  useEffect(() => () => void audioCtxRef.current?.close(), []);

  // The podcast is keyed by the objectives the student is still working on, so
  // we retrieve the same struggling set ('lost'/'unsure') it was generated for.
  const objectiveIds = useMemo(() => {
    if (!reflectionData) {
      return [];
    }
    return Object.entries(reflectionData.objectiveReflections)
      .filter(
        ([, value]) =>
          value === LessonObjectiveReflectionValues.LOST ||
          value === LessonObjectiveReflectionValues.UNSURE
      )
      .map(([objectiveId]) => objectiveId);
  }, [reflectionData]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Fetch the mp3 as a blob and hand the audio element an object URL. A blob
  // keeps the scrubber and skip controls working, since the controller serves
  // the file via send_data without HTTP range support.
  //
  // A podcast is generated whenever the student submits a reflection, keyed by
  // their struggling objectives — an empty set when they rated everything "Got
  // it", which is a valid lesson-level podcast. So we retrieve whenever a
  // reflection exists; only the no-reflection case has nothing to fetch.
  useEffect(() => {
    if (!reflectionData) {
      setStatus('unavailable');
      return;
    }

    const params = new URLSearchParams();
    params.set('lesson_id', String(lessonId));
    objectiveIds.forEach(id => params.append('objective_ids[]', id));
    const query = params.toString();

    let cancelled = false;
    let objectUrl: string | null = null;
    setStatus('loading');
    setScriptLines(null);

    HttpClient.get(`/ai_student_podcasts/retrieve_podcast_from_s3?${query}`)
      .then(response => response.blob())
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });

    // The transcript lives on the podcast record — its podcast_script is a JSON
    // string of {voice_id, text} lines — so fetch it from the show route in
    // parallel with the audio.
    HttpClient.get(`/ai_student_podcasts?${query}`)
      .then(response => response.json())
      .then((data: {podcast_script?: string | null}) => {
        if (cancelled || !data.podcast_script) return;
        setScriptLines(JSON.parse(data.podcast_script) as ScriptLine[]);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lessonId, objectiveIds, reflectionData]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      setupAnalyser();
      // The context may start suspended under the autoplay policy; resuming
      // within this click gesture lets the analyser receive samples.
      void audioCtxRef.current?.resume();
      audio.play().catch(() => {});
    }
    setIsPlaying(p => !p);
  }, [isPlaying, setupAnalyser]);

  const skipBack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - 10
      );
    }
  }, []);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + 10
      );
    }
  }, []);

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

  return (
    <div className={styles.container}>
      <audio ref={audioRef} src={audioSrc ?? undefined}>
        <track
          kind="captions"
          label="English captions"
          src=""
          srcLang="en"
          default
        />
      </audio>

      <p className={styles.overline}>Podcast</p>

      <Waveform analyser={analyser} isPlaying={isPlaying} />

      <div className={styles.playerArea}>
        <div className={styles.volumeRow}>
          <FontAwesomeV6Icon iconName="volume" />
        </div>

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

        <div className={styles.timestamps}>
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={skipBack}
            disabled={status !== 'ready'}
            aria-label="Skip back 10 seconds"
          >
            <FontAwesomeV6Icon iconName="backward-fast" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={togglePlay}
            disabled={status !== 'ready'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <FontAwesomeV6Icon iconName={isPlaying ? 'pause' : 'play'} />
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={skipForward}
            disabled={status !== 'ready'}
            aria-label="Skip forward 10 seconds"
          >
            <FontAwesomeV6Icon iconName="forward-fast" />
          </button>
        </div>
      </div>

      {status === 'ready' && scriptLines ? (
        <details className={styles.transcript}>
          <summary className={styles.transcriptTitle}>TRANSCRIPT</summary>
          <div className={styles.transcriptLines}>
            {scriptLines.map((line, i) => (
              <p key={i} className={styles.transcriptLine}>
                <span
                  className={`${styles.speaker} ${
                    line.voice_id === 'Sam' ? styles.speakerSam : ''
                  }`}
                >
                  {line.voice_id}
                </span>
                {line.text}
              </p>
            ))}
          </div>
        </details>
      ) : (
        <p className={styles.description}>
          {status === 'loading' &&
            "Putting together this lesson's podcast. One moment…"}
          {status === 'unavailable' &&
            "This lesson's podcast isn't ready yet. Check back soon."}
          {status === 'ready' &&
            "This lesson's concepts, explained as a short audio summary. Press play to listen."}
        </p>
      )}
    </div>
  );
};

export default PodcastsBox;
