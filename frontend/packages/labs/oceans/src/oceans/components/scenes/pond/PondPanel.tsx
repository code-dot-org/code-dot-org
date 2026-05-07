import React from "react";
import {getState, setState} from "@ml/oceans/state";
import styles from "@ml/oceans/styles";
import I18n from "@ml/oceans/i18n";
import Markdown from "@ml/utils/Markdown";

class PondPanel extends React.Component {
  onPondPanelClick = e => {
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
          <div style={styles.pondPanelLeft} onClick={this.onPondPanelClick}>
            {state.pondExplainGeneralSummary && (
              <div>
                <div style={styles.pondPanelPreText}>
                  {I18n.t('mostImportantParts')}
                </div>
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <div key={i}>
                    {f.importance > 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelGeneralBar,
                            width:
                              (Math.abs(f.importance) /
                                state.pondExplainGeneralSummary[0].importance) *
                              100 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelGeneralBarText}>
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div style={styles.pondPanelPostText}>
                  {I18n.t('clickIndividualFish')}
                </div>
              </div>
            )}
          </div>
        )}
        {state.pondClickedFish && (
          <div
            style={
              state.pondPanelSide === 'left'
                ? styles.pondPanelLeft
                : styles.pondPanelRight
            }
            onClick={e => this.onPondPanelClick(e)}
          >
            {state.pondExplainFishSummary && (
              <div>
                <div style={styles.pondPanelPreText} id="pondTextMarkdown">
                  <Markdown
                    markdown={I18n.t(
                      'mostImportantPartsDescription',
                      {
                        word: state.word.toLowerCase(),
                        notWord: I18n.t('notWord', {
                          word: state.word
                        }).toLowerCase()
                      }
                    )}
                  />
                </div>
                {state.pondExplainFishSummary.slice(0, 4).map((f, i) => (
                  <div key={i}>
                    {f.impact < 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelGreenBar,
                            width:
                              ((Math.abs(f.impact) / maxExplainValue) * 100) /
                              2 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelGreenBarText}>
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                    {f.impact > 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelRedBar,
                            width:
                              ((Math.abs(f.impact) / maxExplainValue) * 100) /
                              2 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelRedBarText}>
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
