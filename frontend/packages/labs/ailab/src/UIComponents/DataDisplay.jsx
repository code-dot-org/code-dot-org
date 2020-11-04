/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getEmptyCellDetails } from "../redux";

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
      <div>
        {this.props.data.length > 0 && (
          <div>
            <h2>Imported Data</h2>
            {this.state.showRawData && (
              <div>
                <p onClick={this.toggleRawData}>hide data</p>
                {JSON.stringify(this.props.data)}
              </div>
            )}
            {!this.state.showRawData && (
              <p onClick={this.toggleRawData}>show data</p>
            )}
            <h3>There are {this.props.data.length} rows of data.</h3>
            <h3>There are {this.props.emptyCellDetails.length} empty cells.</h3>
            {this.state.showEmptyCellDetails && (
              <div>
                <p onClick={this.toggleEmptyCellDetails}>
                  hide empty cell details
                </p>
                {this.props.emptyCellDetails.map((cellDetails, i) => {
                  return <p key={i}>{cellDetails}</p>;
                })}
              </div>
            )}
            {!this.state.showEmptyCellDetails && (
              <p onClick={this.toggleEmptyCellDetails}>
                show empty cell details
              </p>
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
