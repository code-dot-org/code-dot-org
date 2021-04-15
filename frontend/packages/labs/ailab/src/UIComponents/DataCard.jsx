/* React component to show information about the currently-selected data set. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "../constants.js";

class DataCard extends Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.array,
    metadata: PropTypes.object,
    dataLength: PropTypes.number
  };

  render() {
    const { name, metadata, data, dataLength } = this.props;

    const card = metadata && metadata.card;

    const dataLengthLimit = 20000;
    if (dataLength > dataLengthLimit) {
      window.alert(
        "Warning: Datasets with more than 20,000 rows will slow down the user experience."
      );
    }

    return (
      dataLength !== 0 && (
        <div id="data-card" style={{ ...styles.panel, ...styles.rightPanel }}>
          <div style={styles.largeText}>{name || "Details"}</div>
          <div style={styles.scrollableContents}>
            <div style={styles.scrollingContents}>
              {card && (
                <div>
                  <div style={styles.cardRow}>{metadata.card.description}</div>
                  <div>
                    <span style={styles.italic}>
                      Source: &nbsp;
                      {metadata.card.source}
                    </span>
                  </div>
                  <div>
                    <span style={styles.italic}>
                      Rows of data: &nbsp;
                      {dataLength}
                    </span>
                  </div>
                  {metadata.card.lastUpdated && (
                    <div>
                      <span style={styles.italic}>
                        Last updated: &nbsp;
                        {metadata.card.lastUpdated}
                      </span>
                    </div>
                  )}

                  {metadata.card.context.potentialUses && (
                    <div style={styles.cardRow}>
                      <div style={styles.bold}>Potential uses:</div>
                      <div style={styles.italic}>
                        {metadata.card.context.potentialUses}
                      </div>
                    </div>
                  )}
                  {metadata.card.context.potentialMisuses && (
                    <div style={styles.cardRow}>
                      <div style={styles.bold}>Potential misuses:</div>
                      <div style={styles.italic}>
                        {metadata.card.context.potentialMisuses}
                      </div>
                    </div>
                  )}

                  <div style={styles.bold}>Columns:</div>
                  <div style={styles.contents}>
                    {metadata.fields.map(field => {
                      return (
                        <div key={field.id} style={styles.cardRow}>
                          <div style={styles.bold}>{field.id}:</div>
                          {field.description}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {!card && dataLength > 0 && (
                <div>
                  <br />
                  <div style={styles.bold}>Columns:</div>
                  <div style={styles.cardRow}>
                    <div style={styles.bold}>Rows of data:</div>
                    {dataLength}
                  </div>
                  <div style={styles.contents}>
                    {Object.keys(data[0]).map(key => {
                      return (
                        <div key={key} style={styles.cardRow}>
                          <div style={styles.bold}>{key}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    );
  }
}

export default connect(state => ({
  name: state.name,
  metadata: state.metadata,
  data: state.data,
  dataLength: state.data.length
}))(DataCard);
