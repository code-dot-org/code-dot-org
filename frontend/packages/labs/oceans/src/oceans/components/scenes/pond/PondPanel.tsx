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
            className="ocean-pond-panel--left"
            onClick={
              this.onPondPanelClick as React.MouseEventHandler<HTMLElement>
            }
          >
            {state.pondExplainGeneralSummary && (
              <Box>
                <Box className="ocean-pond-panel__pre-text">
                  {I18n.t('mostImportantParts')}
                </Box>
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <Box key={i}>
                    {f.importance > 0 && (
                      <Box className="ocean-pond-panel__row">
                        &nbsp;
                        <Box
                          className="ocean-pond-panel__bar--general"
                          style={barWidthStyle(
                            (Math.abs(f.importance) /
                              state.pondExplainGeneralSummary![0].importance) *
                              100,
                          )}
                        >
                          &nbsp;
                        </Box>
                        <Box className="ocean-pond-panel__bar-text--general">
                          {I18n.t(f.partType)}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
                <Box className="ocean-pond-panel__post-text">
                  {I18n.t('clickIndividualFish')}
                </Box>
              </Box>
            )}
          </Box>
        )}
        {state.pondClickedFish && (
          <Box
            className={
              state.pondPanelSide === 'left'
                ? 'ocean-pond-panel--left'
                : 'ocean-pond-panel--right'
            }
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              this.onPondPanelClick(e as React.MouseEvent)
            }
          >
            {state.pondExplainFishSummary && (
              <Box>
                <Box
                  className="ocean-pond-panel__pre-text"
                  id="pondTextMarkdown"
                >
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
                      <Box className="ocean-pond-panel__row">
                        &nbsp;
                        <Box
                          className="ocean-pond-panel__bar--green"
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                        >
                          &nbsp;
                        </Box>
                        <Box className="ocean-pond-panel__bar-text--green">
                          {I18n.t(f.partType)}
                        </Box>
                      </Box>
                    )}
                    {f.impact > 0 && (
                      <Box className="ocean-pond-panel__row">
                        &nbsp;
                        <Box
                          className="ocean-pond-panel__bar--red"
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                        >
                          &nbsp;
                        </Box>
                        <Box className="ocean-pond-panel__bar-text--red">
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
