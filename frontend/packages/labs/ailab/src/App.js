import React, { Component } from "react";
import PropTypes from "prop-types";
import SelectDataset from "./UIComponents/SelectDataset";
import SpecifyColumns from "./UIComponents/SpecifyColumns";
import DataDisplay from "./UIComponents/DataDisplay";
import ColumnInspector from "./UIComponents/ColumnInspector";
import CrossTab from "./UIComponents/CrossTab";
import DataCard from "./UIComponents/DataCard";
import SelectTrainer from "./UIComponents/SelectTrainer";
import TrainModel from "./UIComponents/TrainModel";
import Results from "./UIComponents/Results";
import Predict from "./UIComponents/Predict";
import SaveModel from "./UIComponents/SaveModel";
import { styles } from "./constants";
import { connect } from "react-redux";
import {
  getPanels,
  getPanelButtons,
  setCurrentPanel,
  validationMessages
} from "./redux";

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
    return null;

    /*
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
    */
  }
}

class PanelButtons extends Component {
  static propTypes = {
    panels: PropTypes.arrayOf(PropTypes.object),
    panelButtons: PropTypes.object,
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func
  };

  render() {
    const { panelButtons, setCurrentPanel } = this.props;

    return (
      <div>
        {panelButtons.prev && (
          <div style={styles.previousButton}>
            <button
              type="button"
              style={styles.navButton}
              onClick={() => setCurrentPanel(panelButtons.prev.panel)}
            >
              &#9664; &nbsp;
              {panelButtons.prev.text}
            </button>
          </div>
        )}

        {panelButtons.next && (
          <div style={styles.nextButton}>
            <button
              type="button"
              style={styles.navButton}
              onClick={() => setCurrentPanel(panelButtons.next.panel)}
            >
              {panelButtons.next.text}
              &nbsp; &#9654;
            </button>
          </div>
        )}
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

    const panelContainer = [
      "selectTrainer",
      "trainModel",
      "saveModel"
    ].includes(currentPanel)
      ? styles.panelContainerFullWidth
      : styles.panelContainer;

    return (
      <div id="panel-container" style={panelContainer}>
        {currentPanel === "selectDataset" && <SelectDataset />}
        {currentPanel === "specifyColumns" && <SpecifyColumns />}
        {currentPanel === "dataDisplayLabel" && <DataDisplay />}
        {currentPanel === "dataDisplayFeatures" && <DataDisplay />}
        {currentPanel === "selectTrainer" && <SelectTrainer />}
        {currentPanel === "trainModel" && <TrainModel />}
        {currentPanel === "results" && <Results />}
        {currentPanel === "saveModel" && (
          <SaveModel saveTrainedModel={saveTrainedModel} />
        )}
      </div>
    );
  }
}

/*
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
*/

class App extends Component {
  static propTypes = {
    panels: PropTypes.arrayOf(PropTypes.object),
    panelButtons: PropTypes.object,
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    validationMessages: PropTypes.object,
    saveTrainedModel: PropTypes.func,
    resultsPhase: PropTypes.number
  };

  render() {
    const {
      panels,
      panelButtons,
      currentPanel,
      setCurrentPanel,
      saveTrainedModel,
      resultsPhase
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
          {["dataDisplayLabel", "dataDisplayFeatures"].includes(
            currentPanel
          ) && <ColumnInspector />}
          {["dataDisplayLabel", "dataDisplayFeatures"].includes(
            currentPanel
          ) && <CrossTab />}
          {currentPanel === "selectDataset" && <DataCard />}
          {currentPanel === "results" && resultsPhase === 3 && <Predict />}
          <PanelButtons
            panels={panels}
            panelButtons={panelButtons}
            currentPanel={currentPanel}
            setCurrentPanel={setCurrentPanel}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    panels: getPanels(state),
    panelButtons: getPanelButtons(state),
    currentPanel: state.currentPanel,
    validationMessages: validationMessages(state),
    resultsPhase: state.resultsPhase
  }),
  dispatch => ({
    setCurrentPanel(panel) {
      dispatch(setCurrentPanel(panel));
    }
  })
)(App);
