import {Typography} from '@mui/material';

import styles from '../authoring.module.scss';

interface UnsupportedLevelProps {
  levelKey: string;
  levelType: string;
  reason?: string;
  properties?: Record<string, unknown>;
}

/**
 * Honest fallback for real Levelbuilder level types this prototype can't run
 * without Rails (Sprite Lab, Dance Party, …). Identity is preserved and shown;
 * the author's move is to keep it, replace it, or ask the AI to build a Widget
 * version — never a silent conversion.
 */
export default function UnsupportedLevel({
  levelKey,
  levelType,
  reason,
}: UnsupportedLevelProps) {
  return (
    <div className={styles.unsupportedCard}>
      <Typography variant="overline1">{levelType}</Typography>
      <Typography variant="h5">{levelKey}</Typography>
      <Typography variant="body2">
        This activity type runs in the classic Studio runtime and isn’t playable
        in this prototype{reason ? ` (${reason})` : ''}. It keeps its place and
        identity in the lesson. Ask the AI to build an interactive version if
        you want it playable here.
      </Typography>
    </div>
  );
}
