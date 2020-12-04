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
  getPanelVisible,
  getPanelEnabled,
  panelList,
  validationMessages
} from "./redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faCheckSquare } from "@fortawesome/free-regular-svg-icons";

class PanelTabs extends Component {
  static propTypes = {
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func
  };

  getTabStyle(panel) {
    if (getPanelEnabled(panel)) {
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
    const { setCurrentPanel } = this.props;

    return (
      <div style={styles.tabContainer}>
        {panelList
          .filter(panel => {
            return getPanelVisible(panel.id);
          })
          .map(panel => {
            return (
              <div
                key={panel.id}
                style={this.getTabStyle(panel.id)}
                onClick={() => setCurrentPanel(panel.id)}
              >
                {panel.label}
              </div>
            );
          })}
      </div>
    );
  }
}

class Panels extends Component {
  static propTypes = {
    currentPanel: PropTypes.string,
    saveTrainedModel: PropTypes.func
  };

  render() {
    const { currentPanel, saveTrainedModel } = this.props;

    return (
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
            <SaveModel saveTrainedModel={saveTrainedModel} />
          )}
        </div>
      </div>
    );
  }
}

class ValidationMessages extends Component {
  static propTypes = {
    currentPanel: PropTypes.string,
    validationMessages: PropTypes.object
  };

  render() {
    const { currentPanel, validationMessages } = this.props;

    return (
      <div style={styles.validationMessagesLight}>
        {Object.keys(validationMessages).filter(
          messageKey => validationMessages[messageKey].panel === currentPanel
        ).length === 0 && <div>Carry on.</div>}
        {Object.keys(validationMessages)
          .filter(
            messageKey => validationMessages[messageKey].panel === currentPanel
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
    );
  }
}

class App extends Component {
  static propTypes = {
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    validationMessages: PropTypes.object
  };

  render() {
    const { currentPanel, setCurrentPanel, validationMessages } = this.props;

    return (
      <div style={styles.app}>
        <PanelTabs
          currentPanel={currentPanel}
          setCurrentPanel={setCurrentPanel}
        />
        <Panels currentPanel={currentPanel} />
        <ValidationMessages
          currentPanel={currentPanel}
          validationMessages={validationMessages}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    currentPanel: state.currentPanel,
    validationMessages: validationMessages(state)
  }),
  dispatch => ({
    setCurrentPanel(panel) {
      dispatch(setCurrentPanel(panel));
    }
  })
)(App);
