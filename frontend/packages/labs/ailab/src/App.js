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
import { getPanels, setCurrentPanel, validationMessages } from "./redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faCheckSquare } from "@fortawesome/free-regular-svg-icons";

class PanelTabs extends Component {
  static propTypes = {
    panels: PropTypes.arrayOf(PropTypes.object),
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func
  };

  getTabStyle(panel) {
    if (panel.enabled) {
      if (panel.id === this.props.currentPanel) {
        return { ...styles.tab, ...styles.currentTab };
      } else {
        return styles.tab;
      }
    } else {
      return { ...styles.tab, ...styles.disabledTab };
    }
  }

  render() {
    const { panels, setCurrentPanel } = this.props;

    return (
      <div style={styles.tabContainer}>
        {panels.map(panel => {
          return (
            <div
              key={panel.id}
              style={this.getTabStyle(panel)}
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
      <div style={styles.panelContainer}>
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
    panels: PropTypes.arrayOf(PropTypes.object),
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    validationMessages: PropTypes.object,
    saveTrainedModel: PropTypes.func
  };

  render() {
    const {
      panels,
      currentPanel,
      setCurrentPanel,
      validationMessages,
      saveTrainedModel
    } = this.props;

    return (
      <div style={styles.app}>
        <PanelTabs
          panels={panels}
          currentPanel={currentPanel}
          setCurrentPanel={setCurrentPanel}
        />
        <div style={styles.bodyContainer}>
          <Panels
            currentPanel={currentPanel}
            saveTrainedModel={saveTrainedModel}
          />
          <ValidationMessages
            currentPanel={currentPanel}
            validationMessages={validationMessages}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    panels: getPanels(state),
    currentPanel: state.currentPanel,
    validationMessages: validationMessages(state)
  }),
  dispatch => ({
    setCurrentPanel(panel) {
      dispatch(setCurrentPanel(panel));
    }
  })
)(App);
