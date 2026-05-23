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
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <Box key={i}>
                    {f.importance > 0 && (
                      <Box
                        role="img"
                        aria-label={`${I18n.t(f.partType)}: ${Math.round((Math.abs(f.importance) / state.pondExplainGeneralSummary![0].importance) * 100)}% importance`}
                        sx={{
                          position: 'relative',
                          marginBottom: BAR_ITEM_MARGIN,
                        }}
                      >
                        &nbsp;
                        {/* Width driven by --ocean-bar-width CSS variable */}
                        <Box
                          style={barWidthStyle(
                            (Math.abs(f.importance) /
                              state.pondExplainGeneralSummary![0].importance) *
                              100,
                          )}
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
            onClick={e => this.onPondPanelClick(e)}
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
                {state.pondExplainFishSummary.slice(0, 4).map((f, i) => (
                  <Box key={i}>
                    {f.impact < 0 && (
                      <Box
                        role="img"
                        aria-label={`${I18n.t(f.partType)}: supports match`}
                        sx={{
                          position: 'relative',
                          marginBottom: BAR_ITEM_MARGIN,
                        }}
                      >
                        &nbsp;
                        <Box
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            height: BAR_HEIGHT,
                            backgroundColor: 'var(--ocean-color-green)',
                            width: 'var(--ocean-bar-width, 0%)',
                          }}
                        >
                          &nbsp;
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: BAR_LABEL_TOP,
                            left: '53%',
                          }}
                        >
                          {I18n.t(f.partType)}
                        </Box>
                      </Box>
                    )}
                    {f.impact > 0 && (
                      <Box
                        role="img"
                        aria-label={`${I18n.t(f.partType)}: works against match`}
                        sx={{
                          position: 'relative',
                          marginBottom: BAR_ITEM_MARGIN,
                        }}
                      >
                        &nbsp;
                        <Box
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: '50%',
                            height: BAR_HEIGHT,
                            backgroundColor: 'var(--ocean-color-red)',
                            width: 'var(--ocean-bar-width, 0%)',
                          }}
                        >
                          &nbsp;
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: BAR_LABEL_TOP,
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
