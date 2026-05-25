import {Box} from '@mui/material';
import * as React from 'react';

import {
  BAR_HEIGHT,
  BAR_ITEM_MARGIN,
  BAR_LABEL_TOP,
  barWidthStyle,
  panelBaseSx,
} from '@/oceans/components/scenes/pond/pondPanelStyles';
import I18n from '@/oceans/i18n';
import Markdown from '@/utils/Markdown';

/*
 * Fish-specific (fish-clicked) variant of the pond explanation panel.
 * Shows the clicked fish's top-4 most-impactful parts as centred-axis bars:
 * green to the right means the part supports the model's match, red to the
 * left means it works against the match.
 */

/** A single entry in the fish-specific explanation summary. */
type ImpactPart = {partType: string; impact: number};

/**
 * Which side of the pond the panel anchors to.  Only 'left' triggers a
 * `left: 3%` anchor; anything else (including null) anchors right.  The
 * loose string matches the shape used in oceans state.ts.
 */
type PanelSide = string | null;

/**
 * Half-scaled percent of the max explain value.  Fish-specific bars sit on a
 * centred axis and grow outward, so each side only gets half the width.
 *
 * @param value - Impact of the current part (signed; magnitude is used).
 * @param max - Maximum impact across all parts.
 * @returns Percent in [0, 50].
 */
function impactPercent(value: number, max: number): number {
  return ((Math.abs(value) / max) * 100) / 2;
}

/** Props for one fish-specific impact bar row. */
interface ImpactBarProps {
  part: ImpactPart;
  /** Max explain value, used as the bar normaliser. */
  max: number;
}

/*
 * One centred-axis impact bar.  Negative impact pushes the bar right (green —
 * supports the match); positive impact pushes it left (red — argues against
 * the match).  Zero impact renders an empty Box so keying stays stable.
 */
function ImpactBar({part, max}: ImpactBarProps) {
  if (part.impact === 0) return <Box />;
  const supports = part.impact < 0;
  const percent = impactPercent(part.impact, max);
  return (
    <Box>
      <Box
        role="img"
        aria-label={`${I18n.t(part.partType)}: ${supports ? 'supports match' : 'works against match'}`}
        sx={{position: 'relative', marginBottom: BAR_ITEM_MARGIN}}
      >
        &nbsp;
        <Box
          style={barWidthStyle(percent)}
          sx={
            supports
              ? {
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  height: BAR_HEIGHT,
                  backgroundColor: 'var(--ocean-color-green)',
                  width: 'var(--ocean-bar-width, 0%)',
                }
              : {
                  position: 'absolute',
                  top: 0,
                  right: '50%',
                  height: BAR_HEIGHT,
                  backgroundColor: 'var(--ocean-color-red)',
                  width: 'var(--ocean-bar-width, 0%)',
                }
          }
        >
          &nbsp;
        </Box>
        <Box
          sx={
            supports
              ? {position: 'absolute', top: BAR_LABEL_TOP, left: '53%'}
              : {
                  position: 'absolute',
                  top: BAR_LABEL_TOP,
                  width: '47%',
                  textAlign: 'right',
                }
          }
        >
          {I18n.t(part.partType)}
        </Box>
      </Box>
    </Box>
  );
}

/** Props for the fish-specific panel wrapper. */
interface PondFishPanelProps {
  summary: ReadonlyArray<ImpactPart>;
  /** Max explain value for the current fish set (matching or recall). */
  maxExplainValue: number;
  /** Word the model trained on — used for the Markdown intro. */
  word: string;
  side: PanelSide;
  onDismiss: (e: React.MouseEvent) => void;
}

function PondFishPanel({
  summary,
  maxExplainValue,
  word,
  side,
  onDismiss,
}: PondFishPanelProps) {
  const notWord = I18n.t('notWord', {word}).toLowerCase();
  const markdown = I18n.t('mostImportantPartsDescription', {
    word: word.toLowerCase(),
    notWord,
  });
  return (
    <Box
      onClick={onDismiss}
      sx={[panelBaseSx, side === 'left' ? {left: '3%'} : {right: '3%'}]}
    >
      <Box>
        <Box id="pondTextMarkdown" sx={{marginBottom: '5%'}}>
          <Markdown markdown={markdown} />
        </Box>
        {summary.slice(0, 4).map((part, i) => (
          <ImpactBar key={i} part={part} max={maxExplainValue} />
        ))}
      </Box>
    </Box>
  );
}

export default PondFishPanel;
