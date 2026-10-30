/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
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
      <div>
        {!state.pondClickedFish && (
          <div
            className="ocean-pond-panel--left"
            onClick={this.onPondPanelClick}
          >
            {state.pondExplainGeneralSummary && (
              <div>
                <div className="ocean-pond-panel__pre-text">
                  {I18n.t('mostImportantParts')}
                </div>
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <div key={i}>
                    {f.importance > 0 && (
                      <div className="ocean-pond-panel__row">
                        &nbsp;
                        <div
                          className="ocean-pond-panel__bar--general"
                          style={barWidthStyle(
                            (Math.abs(f.importance) /
                              state.pondExplainGeneralSummary![0].importance) *
                              100,
                          )}
                        >
                          &nbsp;
                        </div>
                        <div className="ocean-pond-panel__bar-text--general">
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="ocean-pond-panel__post-text">
                  {I18n.t('clickIndividualFish')}
                </div>
              </div>
            )}
          </div>
        )}
        {state.pondClickedFish && (
          <div
            className={
              state.pondPanelSide === 'left'
                ? 'ocean-pond-panel--left'
                : 'ocean-pond-panel--right'
            }
            onClick={e => this.onPondPanelClick(e)}
          >
            {state.pondExplainFishSummary && (
              <div>
                <div
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
                </div>
                {state.pondExplainFishSummary.slice(0, 4).map((f, i) => (
                  <div key={i}>
                    {f.impact < 0 && (
                      <div className="ocean-pond-panel__row">
                        &nbsp;
                        <div
                          className="ocean-pond-panel__bar--green"
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                        >
                          &nbsp;
                        </div>
                        <div className="ocean-pond-panel__bar-text--green">
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                    {f.impact > 0 && (
                      <div className="ocean-pond-panel__row">
                        &nbsp;
                        <div
                          className="ocean-pond-panel__bar--red"
                          style={barWidthStyle(
                            ((Math.abs(f.impact) / maxExplainValue) * 100) / 2,
                          )}
                        >
                          &nbsp;
                        </div>
                        <div className="ocean-pond-panel__bar-text--red">
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
export default PondPanel;
