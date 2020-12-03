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
    const data = this.props.data;

    return (
      <div id="data-display">

        <div style={styles.panel}>
          <div style={styles.largeText}>Imported Data</div>
          {this.state.showRawData && (
            <div>
              <div style={styles.finePrint}>
                {/*
                <table style={{whiteSpace: "nowrap"}}>
                  {data.length > 0 && (
                    <tbody>
                      {Object.keys(data[0]).map((key, index) => {
                        return (
                          <tr key={index}>
                            <td style={{display: "inline-block", width: 140, backgroundColor: "black", color: "white", textAlign: 'left'}}>
                              {key}
                            </td>
                            {data.map((row, index) => {
                              return (
                                <td key={index} style={{display: "inline-block", width: 120, textAlign: 'right'}}>
                                  {row[key]}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>

                <br/>
                <br/>
                */}

                <table style={{whiteSpace: "nowrap"}}>
                  <thead>
                    <tr>
                      {data.length > 0 && Object.keys(data[0]).map(key => {
                        return (
                          <th key={key} style={{display: "inline-block", width: 120, backgroundColor: "black", color: "white", textAlign: 'right'}}>
                            {key}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 && data.map((row, index) => {
                      return (
                        <tr key={index}>
                          {data.length > 0 && Object.keys(row).map(key => {
                            return (
                              <td key={key} style={{display: "inline-block", width: 120, textAlign: 'right'}}>
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

export default connect(state => ({
  data: state.data,
  emptyCellDetails: getEmptyCellDetails(state)
}))(DataDisplay);
