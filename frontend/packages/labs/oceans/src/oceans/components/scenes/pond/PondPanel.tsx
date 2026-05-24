import {Box} from '@mui/material';
import * as React from 'react';

import I18n from '@/oceans/i18n';
import {getState, setState} from '@/oceans/state';
import Markdown from '@/utils/Markdown';

/**
 * Inline style that drives one explanation bar via the --ocean-bar-width CSS
 * custom property.  The width genuinely depends on a per-render computed
 * value so it must remain an inline CSS variable rather than a static sx.
 */
function barWidthStyle(percent: number): React.CSSProperties {
  return {
    ['--ocean-bar-width' as keyof React.CSSProperties]: `${percent}%`,
  } as React.CSSProperties;
}

const BAR_ITEM_MARGIN = '7%';
const BAR_HEIGHT = '150%';
const BAR_LABEL_TOP = '30%';

/** Fish-part summary entry from the trained model's general explanation. */
type GeneralPart = {partType: string; importance: number};

/** Fish-part summary entry from a specific fish's per-prediction explanation. */
type ImpactPart = {partType: string; impact: number};

/**
 * Percent of the lead (most-important) part's importance.  Used to scale
 * bar widths so the top part shows as 100% and the rest shrink proportionally.
 *
 * @param value - Importance of the current part (can be negative; magnitude is used).
 * @param lead - Importance of the highest-ranked part in the summary.
 * @returns Percent in [0, 100].
 */
function importancePercent(value: number, lead: number): number {
  return (Math.abs(value) / lead) * 100;
}

/**
 * Half-scaled percent of the max explain value.  The fish-specific bars sit
 * on a centred axis and grow outward, so each side only gets half the width.
 *
 * @param value - Impact of the current part (signed; magnitude is used).
 * @param max - Maximum impact across all parts (the bar normaliser).
 * @returns Percent in [0, 50].
 */
function impactPercent(value: number, max: number): number {
  return ((Math.abs(value) / max) * 100) / 2;
}

/**
 * Render one general-importance bar (left-anchored, teal).  Renders nothing
 * when the part's importance is zero or negative — those aren't surfaced in
 * the panel.
 *
 * @param part - The fish-part summary entry.
 * @param lead - Lead part's importance, for normalisation.
 * @param key - React key for the wrapping element.
 */
function renderGeneralImportanceBar(
  part: GeneralPart,
  lead: number,
  key: number,
): React.ReactNode {
  if (part.importance <= 0) return <Box key={key} />;
  const percent = importancePercent(part.importance, lead);
  return (
    <Box key={key}>
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

/**
 * Render one fish-specific impact bar.  Negative impact pushes the bar
 * right (green — supports the match); positive impact pushes it left
 * (red — argues against the match).  Zero impact renders nothing.
 *
 * @param part - The fish-part summary entry.
 * @param max - Max explain value, for normalisation.
 * @param key - React key for the wrapping element.
 */
function renderImpactBar(
  part: ImpactPart,
  max: number,
  key: number,
): React.ReactNode {
  if (part.impact === 0) return <Box key={key} />;
  const supports = part.impact < 0;
  const percent = impactPercent(part.impact, max);
  return (
    <Box key={key}>
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

/** sx shared by both panel variants (left and right). */
const panelBaseSx = {
  position: 'absolute',
  width: '30%',
  backgroundColor: 'var(--ocean-color-transparent-black)',
  color: 'var(--ocean-color-white)',
  borderRadius: '10px',
  top: '16%',
  padding: '2%',
  pointerEvents: 'none',
} as const;

class PondPanel extends React.Component {
  onPondPanelClick = (e: React.MouseEvent) => {
    setState({pondPanelShowing: false});
    e.stopPropagation();
  };

  render() {
    const state = getState();

    const maxExplainValue = state.showRecallFish
      ? state.pondRecallFishMaxExplainValue
      : state.pondFishMaxExplainValue;

    return (
      <Box>
        {!state.pondClickedFish && (
          <Box onClick={this.onPondPanelClick} sx={[panelBaseSx, {left: '3%'}]}>
            {state.pondExplainGeneralSummary && (
              <Box>
                <Box sx={{marginBottom: '5%'}}>
                  {I18n.t('mostImportantParts')}
                </Box>
                {state.pondExplainGeneralSummary
                  .slice(0, 5)
                  .map((part, i) =>
                    renderGeneralImportanceBar(
                      part,
                      state.pondExplainGeneralSummary![0].importance,
                      i,
                    ),
                  )}
                <Box sx={{marginTop: '3%'}}>
                  {I18n.t('clickIndividualFish')}
                </Box>
              </Box>
            )}
          </Box>
        )}
        {state.pondClickedFish && (
          <Box
            onClick={this.onPondPanelClick}
            sx={[
              panelBaseSx,
              state.pondPanelSide === 'left' ? {left: '3%'} : {right: '3%'},
            ]}
          >
            {state.pondExplainFishSummary && (
              <Box>
                <Box id="pondTextMarkdown" sx={{marginBottom: '5%'}}>
                  <Markdown
                    markdown={I18n.t('mostImportantPartsDescription', {
                      word: state.word!.toLowerCase(),
                      notWord: I18n.t('notWord', {
                        word: state.word!,
                      }).toLowerCase(),
                    })}
                  />
                </Box>
                {state.pondExplainFishSummary
                  .slice(0, 4)
                  .map((part, i) => renderImpactBar(part, maxExplainValue, i))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
}
export default PondPanel;
