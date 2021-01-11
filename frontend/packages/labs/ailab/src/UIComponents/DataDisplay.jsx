/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getEmptyCellDetails, setCurrentColumn } from "../redux";
import { styles } from "../constants";
import SelectFeatures from "./SelectFeatures";

class DataDisplay extends Component {
  static propTypes = {
    data: PropTypes.array,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    emptyCellDetails: PropTypes.array,
    setCurrentColumn: PropTypes.func,
    currentColumn: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      showRawData: true,
      showEmptyCellDetails: false,
      showSelectFeatures: null
    };
  }

  toggleRawData = () => {
    this.setState({
      showRawData: !this.state.showRawData
    });
  };

  toggleEmptyCellDetails = () => {
    this.setState({
      showEmptyCellDetails: !this.state.showEmptyCellDetails
    });
  };

  getColumnHeaderStyle = key => {
    if (key === this.props.currentColumn) {
      return styles.dataDisplayHeaderCurrent;
    } else if (key === this.props.labelColumn) {
      return styles.dataDisplayHeaderLabel;
    } else if (this.props.selectedFeatures.includes(key)) {
      return styles.dataDisplayHeaderSelectedFeature;
    } else {
      return styles.dataDisplayHeader;
    }
  };

  getColumnCellStyle = key => {
    if (key === this.props.currentColumn) {
      return styles.dataDisplayCellCurrent;
    } else if (key === this.props.labelColumn) {
      return styles.dataDisplayCellLabel;
    } else if (this.props.selectedFeatures.includes(key)) {
      return styles.dataDisplayCellSelectedFeature;
    } else {
      return styles.dataDisplayCell;
    }
  };

  showSelectFeatures = (mode) => {
    this.setState({showSelectFeatures: mode});
  };

  onSelectFeaturesClose = () => {
    this.setState({showSelectFeatures: null});
  };

  render() {
    const { data, setCurrentColumn } = this.props;

    return (
      <div id="data-display">
        {this.state.showSelectFeatures && (
          <SelectFeatures mode={this.state.showSelectFeatures} onClose={this.onSelectFeaturesClose}/>
        )}

        <div style={{ fontSize: 36 }}>
          Predict{" "}
          <span style={{ color: "rgb(186, 168, 70)" }} onClick={() => this.showSelectFeatures("label")}>
            {this.props.labelColumn || "..."}
          </span>{" "}
          based on{" "}
          <span style={{ color: "rgb(70, 186, 168)" }} onClick={() => this.showSelectFeatures("features")}>
            {this.props.selectedFeatures.length > 0
              ? this.props.selectedFeatures.join(", ")
              : ".."}
          </span>
          {"."}
        </div>
        <br />
        <div style={styles.panel}>
          <div style={styles.largeText}>Imported Data</div>
          {this.state.showRawData && (
            <div>
              <div style={styles.finePrint}>
                <table style={styles.dataDisplayTable}>
                  <thead>
                    <tr>
                      {data.length > 0 &&
                        Object.keys(data[0]).map(key => {
                          return (
                            <th
                              key={key}
                              style={this.getColumnHeaderStyle(key)}
                            >
                              {key}
                            </th>
                          );
                        })}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 &&
                      data.map((row, index) => {
                        return (
                          <tr key={index}>
                            {data.length > 0 &&
                              Object.keys(row).map(key => {
                                return (
                                  <td
                                    key={key}
                                    style={this.getColumnCellStyle(key)}
                                    onClick={() => setCurrentColumn(key)}
                                  >
                                    {row[key]}
                                  </td>
                                );
                              })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!this.state.showRawData && (
            <button type="button" onClick={this.toggleRawData}>
              show data
            </button>
          )}
          <div style={styles.mediumText}>
            There are {this.props.data.length} rows of data.
          </div>

          <div style={styles.mediumText}>
            There are {this.props.emptyCellDetails.length} empty cells.
          </div>
          {this.state.showEmptyCellDetails && (
            <div>
              <button type="button" onClick={this.toggleEmptyCellDetails}>
                hide empty cell details
              </button>
              {this.props.emptyCellDetails.map((cellDetails, i) => {
                return <p key={i}>{cellDetails}</p>;
              })}
            </div>
          )}
          {!this.state.showEmptyCellDetails &&
            this.props.emptyCellDetails.length > 0 && (
              <button type="button" onClick={this.toggleEmptyCellDetails}>
                show empty cell details
              </button>
            )}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    data: state.data,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    emptyCellDetails: getEmptyCellDetails(state),
    currentColumn: state.currentColumn
  }),
  dispatch => ({
    setCurrentColumn(column) {
      dispatch(setCurrentColumn(column));
    }
  })
)(DataDisplay);
