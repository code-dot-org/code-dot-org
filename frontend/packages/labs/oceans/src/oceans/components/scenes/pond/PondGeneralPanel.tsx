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

/*
 * General (no-fish-clicked) variant of the pond explanation panel.
 * Shows the trained model's top-5 most-important fish parts as left-anchored
 * teal bars normalised against the lead part.
 */

/** A single entry in the general explanation summary. */
type GeneralPart = {partType: string; importance: number};

/**
 * Percent of the lead (most-important) part's importance.  Used to scale bar
 * widths so the top part shows as 100% and the rest shrink proportionally.
 *
 * @param value - Importance of the current part.  Negative values are treated
 *   as magnitude — the general panel doesn't care about sign.
 * @param lead - Importance of the highest-ranked part in the summary.
 * @returns Percent in [0, 100].
 */
function importancePercent(value: number, lead: number): number {
  return (Math.abs(value) / lead) * 100;
}

/** Props for one general-importance bar row. */
interface GeneralImportanceBarProps {
  part: GeneralPart;
  /** Lead part's importance, used as the bar normaliser. */
  lead: number;
}

/*
 * One left-anchored teal bar.  Zero / negative importance renders an empty
 * Box so the keying stays stable across the summary slice.
 */
function GeneralImportanceBar({part, lead}: GeneralImportanceBarProps) {
  if (part.importance <= 0) return <Box />;
  const percent = importancePercent(part.importance, lead);
  return (
    <Box>
      <Box
        role="img"
        aria-label={`${I18n.t(part.partType)}: ${Math.round(percent)}% importance`}
        sx={{position: 'relative', marginBottom: BAR_ITEM_MARGIN}}
      >
        &nbsp;
        {/* Width driven by --ocean-bar-width CSS variable. */}
        <Box
          style={barWidthStyle(percent)}
          sx={{
            position: 'absolute',
            top: 0,
            left: '0%',
            height: BAR_HEIGHT,
            backgroundColor: 'var(--ocean-color-teal)',
            width: 'var(--ocean-bar-width, 0%)',
          }}
        >
          &nbsp;
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: BAR_LABEL_TOP,
            left: '3%',
            textAlign: 'right',
          }}
        >
          {I18n.t(part.partType)}
        </Box>
      </Box>
    </Box>
  );
}

/** Props for the general panel wrapper. */
interface PondGeneralPanelProps {
  summary: ReadonlyArray<GeneralPart>;
  onDismiss: (e: React.MouseEvent) => void;
}

function PondGeneralPanel({summary, onDismiss}: PondGeneralPanelProps) {
  const lead = summary[0]?.importance ?? 0;
  return (
    <Box onClick={onDismiss} sx={[panelBaseSx, {left: '3%'}]}>
      <Box>
        <Box sx={{marginBottom: '5%'}}>{I18n.t('mostImportantParts')}</Box>
        {summary.slice(0, 5).map((part, i) => (
          <GeneralImportanceBar key={i} part={part} lead={lead} />
        ))}
        <Box sx={{marginTop: '3%'}}>{I18n.t('clickIndividualFish')}</Box>
      </Box>
    </Box>
  );
}

export default PondGeneralPanel;
