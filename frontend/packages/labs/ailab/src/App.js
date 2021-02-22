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

const Container = props => (
  <div style={styles.panelContainer}>{props.children}</div>
);

Container.propTypes = {
  children: PropTypes.node
};

const ContainerFullWidth = props => (
  <div style={styles.panelContainerFullWidth}>{props.children}</div>
);

ContainerFullWidth.propTypes = {
  children: PropTypes.node
};

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
        <div style={styles.bodyContainer}>
          {currentPanel === "selectDataset" && (
            <div>
              <Container>
                <SelectDataset />
              </Container>
              <DataCard />
            </div>
          )}

          {currentPanel === "specifyColumns" && (
            <Container>
              <SpecifyColumns />
            </Container>
          )}

          {["dataDisplayLabel", "dataDisplayFeatures"].includes(
            currentPanel
          ) && (
            <div>
              <Container>
                <DataDisplay />
              </Container>
              <ColumnInspector />
              <CrossTab />
            </div>
          )}

          {currentPanel === "selectTrainer" && (
            <ContainerFullWidth>
              <SelectTrainer />
            </ContainerFullWidth>
          )}

          {currentPanel === "trainModel" && (
            <ContainerFullWidth>
              <TrainModel />
            </ContainerFullWidth>
          )}

          {currentPanel === "results" && (
            <div>
              <Container>
                <Results />
              </Container>
              {resultsPhase === 3 && <Predict />}
            </div>
          )}

          {currentPanel === "saveModel" && (
            <ContainerFullWidth>
              <SaveModel saveTrainedModel={saveTrainedModel} />
            </ContainerFullWidth>
          )}

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
