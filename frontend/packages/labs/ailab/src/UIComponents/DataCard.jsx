/* React component to show information about the currently-selected data set. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants.js";
import ScrollableContent from "./ScrollableContent";
import { metadataShape } from "./shapes.js";
import I18n from "../i18n";

class DataCard extends Component {
  static propTypes = {
    name: PropTypes.string,
    metadata: metadataShape,
    dataLength: PropTypes.number,
    removedRowsCount: PropTypes.number
  };

  render() {

    const { name, metadata, dataLength, removedRowsCount  } = this.props;

    const card = metadata && metadata.card;

    const dataLengthLimit = 20000;
    if (dataLength > dataLengthLimit) {
      window.alert(
        I18n.t("dataCardWarningLargeDataset", {"rowCount": dataLengthLimit})
      );
    }

    const removedRowsMsg =
      removedRowsCount > 0
        ? I18n.t("dataCardRemovedRows", {"rowCount": removedRowsCount})
        : null;

    return (
      dataLength !== 0 && (
        <div id="data-card" style={{ ...styles.panel, ...styles.rightPanel }}>
          <div style={styles.largeText}>{name || I18n.t("dataCardDefaultHeader")}</div>
          <ScrollableContent>
            {card && (
              <div>
                <div style={styles.cardRow}>{metadata.card.description}</div>
                <div style={styles.cardRow}>
                  <span style={styles.italic}>
                    {I18n.t("dataCardSource")}
                    <br />
                    {metadata.card.source}
                  </span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.italic}>
                    {I18n.t("dataCardRowCount")}
                    <br />
                    {dataLength}
                  </span>
                </div>
                {metadata.card.lastUpdated && (
                  <div style={styles.cardRow}>
                    <span style={styles.italic}>
                      {I18n.t("dataCardLastUpdated")}
                      <br />
                      {metadata.card.lastUpdated}
                    </span>
                  </div>
                )}

                {metadata.card.context.potentialUses && (
                  <div style={styles.cardRow}>
                    <div style={styles.bold}>{I18n.t("dataCardPotentialUses")}</div>
                    <div style={styles.italic}>
                      {metadata.card.context.potentialUses}
                    </div>
                  </div>
                )}
                {metadata.card.context.potentialMisuses && (
                  <div style={styles.cardRow}>
                    <div style={styles.bold}>{I18n.t("dataCardPotentialMisuses")}</div>
                    <div style={styles.italic}>
                      {metadata.card.context.potentialMisuses}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!card && dataLength > 0 && (
              <div>
                <br />
                <div style={styles.cardRow}>
                  <div style={styles.bold}>{I18n.t("dataCardRowCount")}</div>
                  {dataLength}
                </div>
                <div style={styles.cardRow}>
                  {removedRowsMsg &&
                    <span>
                      &nbsp;
                      {removedRowsMsg}
                    </span>
                  }
                </div>
              </div>
            )}
          </ScrollableContent>
        </div>
      )
    );
  }
}

export default connect(state => ({
  name: state.name,
  metadata: state.metadata,
  dataLength: state.data.length,
  removedRowsCount: state.removedRowsCount
}))(DataCard);
