/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getEmptyCellDetails } from "../redux";
import { styles } from "../constants";

class DataDisplay extends Component {
  static propTypes = {
    data: PropTypes.array,
    emptyCellDetails: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      showRawData: true,
      showEmptyCellDetails: false
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

  render() {
    return (
      <div id="data-display">
        {this.props.data.length > 0 && (
          <div style={styles.panel}>
            <div style={styles.largeText}>Imported Data</div>
            {this.state.showRawData && (
              <div>
                <button type="button" onClick={this.toggleRawData}>
                  hide data
                </button>
                <div style={styles.finePrint}>
                  {JSON.stringify(this.props.data)}
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
        )}
      </div>
    );
  }
}

export default connect(state => ({
  data: state.data,
  emptyCellDetails: getEmptyCellDetails(state)
}))(DataDisplay);
