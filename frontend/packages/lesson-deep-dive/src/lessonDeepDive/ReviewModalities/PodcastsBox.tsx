import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  LessonDeepDiveData,
  ReflectionData,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
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
  objectives: LessonDeepDiveData['objectives'];
}

type PodcastStatus = 'loading' | 'ready' | 'unavailable';

// One line of the podcast transcript: who is speaking and what they say.
type ScriptLine = {voice_id: string; text: string};

const PodcastsBox: FC<PodcastsBoxProps> = ({
  lessonId,
  reflectionData,
  objectives,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<PodcastStatus>('loading');
  const [scriptLines, setScriptLines] = useState<ScriptLine[] | null>(null);
  // The analyser feeds the live Waveform. It's created lazily on first play
  // (an AudioContext must start from a user gesture), and stays null if Web
  // Audio is unavailable, in which case Waveform falls back to its CSS pulse.
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Routes the audio element through an AnalyserNode once. createMediaElement-
  // Source can only wrap an element a single time, so this is guarded by the
  // analyser already existing. The audio src points at a same-origin route, so
  // the analyser reads real samples (a cross-origin source would read silence).
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
  // When the student bypassed reflection or submitted without rating anything
  // we treat every lesson objective as struggling — matching the key the
  // generation side uses for those same cases.
  const objectiveIds = useMemo(() => {
    if (
      !reflectionData ||
      Object.keys(reflectionData.objectiveReflections).length === 0
    ) {
      return objectives.map(o => o.id);
    }
    return Object.entries(reflectionData.objectiveReflections)
      .filter(
        ([, value]) =>
          value === LessonObjectiveReflectionValues.LOST ||
          value === LessonObjectiveReflectionValues.UNSURE,
      )
      .map(([objectiveId]) => objectiveId);
  }, [reflectionData, objectives]);

  // Build the audio source URL and a query string we can reuse for the
  // transcript fetch. The S3 key (and so the controller route) is keyed by the
  // struggling-objective set. With a reflection, we request the student's
  // struggling set (empty when they rated everything "Got it" — a valid
  // lesson-level podcast). Without a reflection, objectiveIds above falls back
  // to every lesson objective, so we request that podcast.
  const {audioSrc, transcriptQuery} = useMemo(() => {
    const params = new URLSearchParams();
    params.set('lesson_id', String(lessonId));
    objectiveIds.forEach(id => params.append('objective_ids[]', id));
    const query = params.toString();
    return {
      audioSrc: `/ai_student_podcasts/retrieve_podcast_from_s3?${query}`,
      transcriptQuery: query,
    };
  }, [lessonId, objectiveIds]);

  // Reset playback + status whenever the source URL changes (e.g. the student
  // jumps between reflections). The audio element fires canplay / error from
  // its own events to drive status forward.
  useEffect(() => {
    setStatus('loading');
    setScriptLines(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    const onCanPlay = () => setStatus('ready');
    const onError = () => setStatus('unavailable');
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // The transcript lives on the podcast record — its podcast_script is a JSON
  // string of {voice_id, text} lines — so fetch it from the show route.
  useEffect(() => {
    let cancelled = false;
    HttpClient.get(`/ai_student_podcasts?${transcriptQuery}`)
      .then(response => response.json())
      .then((data: {podcast_script?: string | null}) => {
        if (cancelled || !data.podcast_script) return;
        setScriptLines(JSON.parse(data.podcast_script) as ScriptLine[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [transcriptQuery]);

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
        audioRef.current.currentTime - 10,
      );
    }
  }, []);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + 10,
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
    [duration],
  );

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.container}>
      <audio ref={audioRef} src={audioSrc} preload="auto">
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
