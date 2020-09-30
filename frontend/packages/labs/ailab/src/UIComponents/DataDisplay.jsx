/* React component to handle displaying imported data and selecting features. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setLabelColumn,
  setSelectedFeatures,
  setShowPredict,
  setMetaDataByColumn,
  getFeatures,
  ColumnTypes
} from "../redux";

class DataDisplay extends Component {
  static propTypes = {
    data: PropTypes.array,
    features: PropTypes.array,
    labelColumn: PropTypes.string,
    setLabelColumn: PropTypes.func.isRequired,
    selectedFeatures: PropTypes.array,
    setSelectedFeatures: PropTypes.func.isRequired,
    setShowPredict: PropTypes.func.isRequired,
    metaDataByColumn: PropTypes.object,
    setMetaDataByColumn: PropTypes.func.isRequired
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

  handleChangeDataType = (event, feature) => {
    event.preventDefault();
    this.props.setMetaDataByColumn(feature, "dataType", event.target.value);
  };

  handleChangeSelect = event => {
    this.props.setLabelColumn(event.target.value);
    this.props.setShowPredict(false);
  };

  handleChangeMultiSelect = event => {
    this.props.setSelectedFeatures(
      Array.from(event.target.selectedOptions, item => item.value)
    );
    this.props.setShowPredict(false);
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
            <h2>Describe the data in each of your columns</h2>
            <p>
              Categorical columns contain a fixed number of possible values that
              indicate a group. For example, the column "Size" might contain
              categorical data such as "small", "medium" and "large".{" "}
            </p>
            <p>
              Continuous columns contain a range of possible numerical values
              that could fall anywhere on a continuum. For example, the column
              "Height in inches" might contain continuous data such as "12",
              "11.25" and "9.07".{" "}
            </p>
            <p>
              Select "other" if the column contains anything other than
              categorical or continuous data. This is the best choice for "name"
              or "id" columns, for example.
            </p>
            <form>
              {this.props.features.map((feature, index) => {
                return (
                  <div key={index}>
                    {this.props.metaDataByColumn[feature] && (
                      <label>
                        {feature}:
                        <select
                          onChange={event =>
                            this.handleChangeDataType(event, feature)
                          }
                          value={
                            this.props.metaDataByColumn[feature]["dataType"]
                          }
                        >
                          {Object.values(ColumnTypes).map((option, index) => {
                            return (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    )}
                    <br />
                    <br />
                  </div>
                );
              })}
            </form>
            <form>
              <label>
                <h2>Which column contains the labels for your dataset?</h2>
                <p>
                  The model will be trained to predict which catgegory from the
                  label column an example (a set of attributes or features) is
                  most likely to belong to.
                </p>
                <select
                  value={this.props.labelColumn}
                  onChange={this.handleChangeSelect}
                >
                  {this.props.features.map((feature, index) => {
                    return (
                      <option key={index} value={feature}>
                        {feature}
                      </option>
                    );
                  })}
                </select>
              </label>
            </form>
            <form>
              <label>
                <h2>Which features are you interested in training on?</h2>
                <p>
                  Features are the attributes the model will use to make a
                  prediction.
                </p>
                <select
                  multiple={true}
                  value={this.props.selectedFeatures}
                  onChange={this.handleChangeMultiSelect}
                >
                  {this.props.features.map((feature, index) => {
                    return (
                      <option key={index} value={feature}>
                        {feature}
                      </option>
                    );
                  })}
                </select>
              </label>
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    data: state.data,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    features: getFeatures(state),
    metaDataByColumn: state.metaDataByColumn
  }),
  dispatch => ({
    setMetaDataByColumn(column, metadataField, value) {
      dispatch(setMetaDataByColumn(column, metadataField, value));
    },
    setSelectedFeatures(selectedFeatures) {
      dispatch(setSelectedFeatures(selectedFeatures));
    },
    setLabelColumn(labelColumn) {
      dispatch(setLabelColumn(labelColumn));
    },
    setShowPredict(showPredict) {
      dispatch(setShowPredict(showPredict));
    }
  })
)(DataDisplay);
