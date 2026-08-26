import {Typography} from '@mui/material';

import type {GenericLevelData} from '@code-dot-org/authoring';

import styles from '../authoring.module.scss';

type VideoData = Extract<GenericLevelData, {type: 'video'}>;

/**
 * StandaloneVideo projection. Embeds YouTube when the video key resolved
 * through videos.csv; otherwise an honest placeholder naming the real key.
 * Video embeds are the one generic renderer with an external network
 * dependency — the publish report flags them as online-only.
 */
export default function VideoLevel({data}: {data: VideoData}) {
  if (!data.youtubeCode) {
    return (
      <div className={styles.videoPlaceholder}>
        <Typography variant="h5">{data.displayName ?? 'Video'}</Typography>
        <Typography variant="body2">
          Video key “{data.videoKey}” (no local embed available).
        </Typography>
      </div>
    );
  }
  return (
    <div className={styles.videoFrameWrap}>
      <iframe
        className={styles.videoFrame}
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(data.youtubeCode)}`}
        title={data.displayName ?? data.videoKey}
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
