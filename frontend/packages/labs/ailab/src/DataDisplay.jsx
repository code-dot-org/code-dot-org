import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setLabelColumn, setSelectedFeatures } from "./redux";

const styles = {
  tableBorder: {
    // border: "1px solid black"
  }
};

class DataDisplay extends Component {
  static propTypes = {
    data: PropTypes.array,
    setLabelColumn: PropTypes.func.isRequired,
    setSelectedFeatures: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showRawData: true
    };
  }

  toggleRawData = () => {
    this.setState({
      showRawData: !this.state.showRawData
    });
  };

  getFeatures = () => {
    return Object.keys(this.props.data[0]);
  };

  getHeader = () => {
    var features = this.getFeatures();
    return features.map((feature, index) => {
      return (
        <th key={index} style={styles.tableBorder}>
          {feature.toUpperCase()}
        </th>
      );
    });
  };

  getRowsData() {
    var rowsData = this.props.data;
    var keys = this.getFeatures();
    return rowsData.map((row, index) => {
      return (
        <tr key={index} style={styles.tableBorder}>
          <RenderRow key={index} keys={keys} data={row} />
        </tr>
      );
    });
  }

  render() {
    return (
      <div>
        {this.props.data && (
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
            <div>
              <table
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  border: "1px solid black"
                }}
              >
                <thead>
                  <tr style={styles.tableBorder}>{this.getHeader()}</tr>
                </thead>
                <tbody>{this.getRowsData()}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const RenderRow = props => {
  return (
    <div>
      {props.keys.map((feature, index) => {
        return (
          <td key={index} style={{ width: "20%" }}>
            {props.data[feature]}
          </td>
        );
      })}
      ;
    </div>
  );
};

export default connect(
  state => ({ data: state.data }),
  dispatch => ({
    setSelectedFeatures(selectedFeatures) {
      dispatch(setSelectedFeatures(selectedFeatures));
    },
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    }
  })
)(DataDisplay);
