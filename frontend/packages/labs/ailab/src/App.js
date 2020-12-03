import React, { Component } from "react";
import PropTypes from "prop-types";
import SelectDataset from "./UIComponents/SelectDataset";
import DataDisplay from "./UIComponents/DataDisplay";
import SelectFeatures from "./UIComponents/SelectFeatures";
import ColumnInspector from "./UIComponents/ColumnInspector";
import SelectTrainer from "./UIComponents/SelectTrainer";
import TrainModel from "./UIComponents/TrainModel";
import Results from "./UIComponents/Results";
import Predict from "./UIComponents/Predict";
import SaveModel from "./UIComponents/SaveModel";
import { styles } from "./constants";
import { connect } from "react-redux";
import {
  setCurrentPanel,
  validationMessages,
  getSelectedColumns,
  isDataUploaded,
  readyToTrain
} from "./redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faBackward,
  faForward,
  faEraser,
  faCheck,
  faSquare,
  faCheckSquare,
  faBan,
  faInfo,
  faTrash
} from "@fortawesome/free-regular-svg-icons";

const panelList = [
  { id: "selectDataset", label: "Import" },
  { id: "dataDisplay", label: "Data" },
  { id: "selectFeatures", label: "Features" },
  { id: "columnInspector", label: "Columns" },
  { id: "selectTrainer", label: "Trainer" },
  { id: "trainModel", label: "Train" },
  { id: "results", label: "Results" },
  { id: "predict", label: "Predict" },
  { id: "saveModel", label: "Save" }
];

function isPanelVisible(panel, mode) {
  if (panel === "selectDataset") {
    if (mode && mode.datasets && mode.datasets.length === 1) {
      return false;
    }
  }

  if (panel === "saveModel") {
    if (mode && mode.hideSave) {
      return false;
    }
  }

  return true;
}

function isPanelEnabled(panel, props) {
  if (panel === "dataDisplay") {
    if (props.data.length === 0) {
      return false;
    }
  }

  if (panel === "columnInspector") {
    if (props.selectedColumns.length === 0) {
      return false;
    }
  }

  if (panel === "selectFeatures") {
    if (!props.isDataUploaded) {
      return false;
    }
  }

  if (panel === "trainModel") {
    if (!props.readyToTrain) {
      return false;
    }
  }

  if (panel === "results") {
    if (
      !props.showPredict ||
      props.percentDataToReserve === 0 ||
      props.accuracyCheckExamples.length === 0
    ) {
      return false;
    }
  }

  // Also see if the previous panel was visible, recursively.
  const panelIndex = panelList.findIndex(element => element.id === panel);
  if (panelIndex > 0) {
    return isPanelEnabled(panelList[panelIndex - 1].id, props);
  }

  return true;
}

class App extends Component {
  static propTypes = {
    mode: PropTypes.object,
    data: PropTypes.array,
    saveTrainedModel: PropTypes.func,
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    validationMessages: PropTypes.object,
    selectedColumns: PropTypes.array,
    isDataUploaded: PropTypes.bool,
    readyToTrain: PropTypes.bool,
    showPredict: PropTypes.bool,
    percentDataToReserve: PropTypes.number,
    accuracyCheckExamples: PropTypes.array
  };

  getStyle(panel) {
    if (isPanelEnabled(panel, this.props)) {
      if (panel === this.props.currentPanel) {
        return { ...styles.tab, ...styles.currentTab };
      } else {
        return styles.tab;
      }
    } else {
      return { ...styles.tab, ...styles.disabledTab };
    }
  }

  render() {
    const {
      mode,
      currentPanel,
      setCurrentPanel,
      validationMessages
    } = this.props;

    return (
      <div>
        <div style={styles.tabContainer}>
          {panelList
            .filter(panel => {
              return isPanelVisible(panel.id, mode);
            })
            .map(panel => {
              return (
                <div
                  key={panel.id}
                  style={this.getStyle(panel.id)}
                  onClick={() => setCurrentPanel(panel.id)}
                >
                  {panel.label}
                </div>
              );
            })}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={styles.container}>
            {currentPanel === "selectDataset" && <SelectDataset />}
            {currentPanel === "dataDisplay" && <DataDisplay />}
            {currentPanel === "selectFeatures" && <SelectFeatures />}
            {currentPanel === "columnInspector" && <ColumnInspector />}
            {currentPanel === "selectTrainer" && <SelectTrainer />}
            {currentPanel === "trainModel" && <TrainModel />}
            {currentPanel === "results" && <Results />}
            {currentPanel === "predict" && <Predict />}
            {currentPanel === "saveModel" && (
              <SaveModel saveTrainedModel={this.props.saveTrainedModel} />
            )}
          </div>

          <div style={styles.validationMessagesLight}>
            {Object.keys(validationMessages).filter(
              messageKey =>
                validationMessages[messageKey].panel === currentPanel
            ).length === 0 && <div>Carry on.</div>}
            {Object.keys(validationMessages)
              .filter(
                messageKey =>
                  validationMessages[messageKey].panel === currentPanel
              )
              .map((key, index) => {
                return validationMessages[key].readyToTrain ? (
                  <p key={index} style={styles.ready}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                    &nbsp;
                    {validationMessages[key].successString}{" "}
                  </p>
                ) : (
                  <p key={index} style={styles.error}>
                    <FontAwesomeIcon icon={faSquare} />
                    &nbsp;
                    {validationMessages[key].errorString}{" "}
                  </p>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    currentPanel: state.currentPanel,
    validationMessages: validationMessages(state),
    selectedColumns: getSelectedColumns(state),
    data: state.data,
    isDataUploaded: isDataUploaded(state),
    readyToTrain: readyToTrain(state),
    showPredict: state.showPredict,
    percentDataToReserve: state.percentDataToReserve,
    accuracyCheckExamples: state.accuracyCheckExamples
  }),
  dispatch => ({
    setCurrentPanel(panel) {
      dispatch(setCurrentPanel(panel));
    }
  })
)(App);
