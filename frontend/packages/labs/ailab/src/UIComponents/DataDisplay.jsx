import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setLabelColumn, setSelectedFeatures } from "../redux";

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
          </div>
        )}
      </div>
    );
  }
}

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
