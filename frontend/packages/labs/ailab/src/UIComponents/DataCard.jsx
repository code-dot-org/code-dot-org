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

    return (
      <div id="data-card">
        {dataLength !== 0 && (
          <div style={styles.rightPanel}>
            <div style={styles.largeText}>Data Information</div>
            <span style={styles.bold}>Name:</span>
            &nbsp;
            {name}
            {card && (
              <div>
                <div style={styles.cardRow}>
                  <span style={styles.bold}>Description:</span>
                  &nbsp;
                  {metadata.card.description}
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.bold}>Source:</span>
                  &nbsp;
                  {metadata.card.source}
                </div>
                <span style={styles.bold}>Columns:</span>
                <div style={styles.subPanel}>
                  {metadata.fields.map(field => {
                    return (
                      <div key={field.id}>
                        <span style={styles.bold}>{field.id}:</span>
                        &nbsp;
                        {field.description}
                      </div>
                    );
                  })}
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.bold}>Rows of data:</span>
                  &nbsp;
                  {dataLength}
                </div>

                <div style={styles.cardRow}>This data has been cleaned & prepared beforehand</div>
                <div style={styles.cardRow}>
                  This Data contains columns that can be used to identify a
                  subgroup of people (for example: by age, by race, by gender,
                  etc):
                </div>

                <div style={styles.cardRow}>
                  <span style={styles.bold}>Potential uses:</span>
                  &nbsp;
                  {metadata.card.context.potentialUses}
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.bold}>Potential misuses:</span>
                  &nbsp;
                  {metadata.card.context.potentialMisuses}
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.bold}>Last updated:</span>
                  &nbsp;
                  {metadata.card.lastUpdated}
                </div>
              </div>
            )}
            {!card && dataLength > 0 && (
              <div>
                <br />
                <span style={styles.bold}>Columns:</span>
                <div style={styles.subPanel}>
                  {Object.keys(data[0]).map(key => {
                    return (
                      <div key={key}>
                        <span style={styles.bold}>{key}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.bold}>Rows of data:</span>
                  &nbsp;
                  {dataLength}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  name: state.name,
  metadata: state.metadata,
  data: state.data,
  dataLength: state.data.length
}))(DataCard);
