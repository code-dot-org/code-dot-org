import Box from '@mui/material/Box';
import * as React from 'react';

import I18n from '@/oceans/i18n';
import {getState, setState} from '@/oceans/state';
import Markdown from '@/utils/Markdown';

/**
 * Inline style object that drives one of the explanation bars via the
 * --ocean-bar-width custom property.  This is the one place where the
 * width genuinely depends on a per-render computed value; the CSS class
 * reads `width: var(--ocean-bar-width)`.
 */
function barWidthStyle(percent: number): React.CSSProperties {
  return {
    ['--ocean-bar-width' as keyof React.CSSProperties]: `${percent}%`,
  } as React.CSSProperties;
}

/** Common sx for the pond info panel container (left or right). */
const PANEL_SX = {
  position: 'absolute',
  width: '30%',
  backgroundColor: 'var(--ocean-color-transparent-black)',
  color: 'var(--ocean-color-white)',
  borderRadius: '10px',
  top: '16%',
  padding: '2%',
  pointerEvents: 'none',
} as const;

/** Bar element sx — only the color and anchor differ per bar type. */
const BAR_BASE_SX = {
  position: 'absolute',
  top: 0,
  height: '150%',
  width: 'var(--ocean-bar-width, 0%)',
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
          <Box
            sx={{...PANEL_SX, left: '3%'}}
            onClick={
              this.onPondPanelClick as React.MouseEventHandler<HTMLElement>
            }
          >
            {state.pondExplainGeneralSummary && (
              <Box>
                <Box sx={{marginBottom: '5%'}}>
                  {I18n.t('mostImportantParts')}
                </Box>
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <Box key={i}>
                    {f.importance > 0 && (
                      <Box sx={{position: 'relative', marginBottom: '7%'}}>
                        &nbsp;
                        <Box
                          sx={{
                            ...BAR_BASE_SX,
                            left: '0%',
                            backgroundColor: 'var(--ocean-color-teal)',
                          }}
                          style={barWidthStyle(
                            (Math.abs(f.importance) /
                              state.pondExplainGeneralSummary![0].importance) *
                              100,
                          )}
                        >
                          &nbsp;
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '30%',
                            left: '3%',
                            textAlign: 'right',
                          }}
                        >
                          {I18n.t(f.partType)}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
                <Box sx={{marginTop: '3%'}}>
                  {I18n.t('clickIndividualFish')}
                </Box>
              </Box>
            )}
          </Box>
        )}
        {state.pondClickedFish && (
          <Box
            sx={{
              ...PANEL_SX,
              ...(state.pondPanelSide === 'left'
                ? {left: '3%'}
                : {right: '3%'}),
            }}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              this.onPondPanelClick(e as React.MouseEvent)
            }
          >
            {state.pondExplainFishSummary && (
              <Box>
                <Box sx={{marginBottom: '5%'}} id="pondTextMarkdown">
                  <Markdown
                    markdown={I18n.t('mostImportantPartsDescription', {
                      word: state.word!.toLowerCase(),
                      notWord: I18n.t('notWord', {
                        word: state.word!,
                      }).toLowerCase(),
                    })}
                  />
                </Box>
                {state.pondExplainFishSummary.slice(0, 4).map((f, i) => (
                  <Box key={i}>
                    {f.impact < 0 && (
                      <Box sx={{position: 'relative', marginBottom: '7%'}}>
                        &nbsp;
                        <Box
                          sx={{
                            ...BAR_BASE_SX,
                            left: '50%',
                            backgroundColor: 'var(--ocean-color-green)',
                          }}
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                        >
                          &nbsp;
                        </Box>
                        <Box
                          sx={{position: 'absolute', top: '30%', left: '53%'}}
                        >
                          {I18n.t(f.partType)}
                        </Box>
                      </Box>
                    )}
                    {f.impact > 0 && (
                      <Box sx={{position: 'relative', marginBottom: '7%'}}>
                        &nbsp;
                        <Box
                          sx={{
                            ...BAR_BASE_SX,
                            right: '50%',
                            backgroundColor: 'var(--ocean-color-red)',
                          }}
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                        >
                          &nbsp;
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '30%',
                            width: '47%',
                            textAlign: 'right',
                          }}
                        >
                          {I18n.t(f.partType)}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
}
export default PondPanel;
