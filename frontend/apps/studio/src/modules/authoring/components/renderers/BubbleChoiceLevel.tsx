import {Typography} from '@mui/material';

import type {GenericLevelData} from '@code-dot-org/authoring';

import styles from '../authoring.module.scss';

type BubbleChoiceData = Extract<GenericLevelData, {type: 'bubbleChoice'}>;

/**
 * BubbleChoice projection: shows the authored choice set. Sublevels in the
 * imported course are Sprite Lab (unsupported here), so choices are shown as
 * an inert menu preserving the real level identities.
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
            <Typography variant="body4">{choice.levelKey}</Typography>
          </li>
        ))}
      </ul>
    </div>
  );
}
