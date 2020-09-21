import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";

class TrainModel extends Component {
  static propTypes = {
    selectedFeatures: PropTypes.array,
    labelColumn: PropTypes.string,
    trainingExamples: PropTypes.array,
    trainingLabels: PropTypes.array
  };

  onClickTrain = () => {
    console.log(
      "train clicked - there will be code here that dips into the svm model"
    );
  };

  render() {
    return (
      <div>
        <h2>Train the Model</h2>
        <p>
          The machine learning algorithm is going to look for patterns in these
          features: {this.props.selectedFeatures.join(", ")} that might help
          predict the values of the label: {this.props.labelColumn}.
        </p>
        )}
        <button type="button" onClick={this.onClickTrain}>
          Train SVM model
        </button>
      </div>
    );
  }
}

export default connect(state => ({
  selectedFeatures: state.selectedFeatures,
  labelColumn: state.labelColumn
}))(TrainModel);
