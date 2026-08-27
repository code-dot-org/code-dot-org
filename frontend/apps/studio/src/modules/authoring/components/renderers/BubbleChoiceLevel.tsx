import {Typography} from '@mui/material';

import type {GenericLevelData} from '@code-dot-org/authoring';

import VideoLevel from './VideoLevel';

import styles from '../authoring.module.scss';

type BubbleChoiceData = Extract<GenericLevelData, {type: 'bubbleChoice'}>;

/**
 * BubbleChoice projection: shows the authored choice set. A choice whose
 * sublevel resolved to a video plays inline — cheap, since VideoLevel exists
 * and the video's own data already came through the importer. Anything else
 * (in the imported catalogs today: a labhost Music sublevel, which would
 * need its own Lab mount and numeric id to actually run) gets an explicit
 * "not supported" note instead of an inert, unlabeled card — same honesty
 * policy as LevelGroupLevel/UnsupportedLevel. `choice.data` is optional-ish
 * here (`choice.data?.`) only to tolerate a session imported before this
 * projection resolved it — a stale snapshot falls back to "not supported"
 * rather than throwing; a fresh import always sets it.
 */
export default function BubbleChoiceLevel({data}: {data: BubbleChoiceData}) {
  return (
    <div>
      {data.displayName && (
        <Typography variant="h5">{data.displayName}</Typography>
      )}
      <ul className={styles.bubbleChoiceList}>
        {data.choices.map(choice => (
          <li key={choice.levelKey} className={styles.bubbleChoiceItem}>
            <Typography variant="body1">
              {choice.displayName ?? choice.levelKey}
            </Typography>
            {choice.data?.type === 'video' ? (
              <VideoLevel data={choice.data} />
            ) : (
              <Typography variant="body4">
                Not supported in this prototype (
                {choice.data?.type === 'opaque'
                  ? choice.data.levelType
                  : (choice.data?.type ?? 'unresolved')}
                ) — {choice.levelKey}
              </Typography>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
