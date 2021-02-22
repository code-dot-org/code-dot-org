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
import { getPanelButtons, setCurrentPanel, validationMessages } from "./redux";

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

const BodyContainer = props => (
  <div style={styles.bodyContainer}>{props.children}</div>
);

BodyContainer.propTypes = {
  children: PropTypes.node
};

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
        {currentPanel === "selectDataset" && (
          <BodyContainer>
            <Container>
              <SelectDataset />
            </Container>
            <DataCard />
          </BodyContainer>
        )}

        {currentPanel === "specifyColumns" && (
          <BodyContainer>
            <Container>
              <SpecifyColumns />
            </Container>
          </BodyContainer>
        )}

        {["dataDisplayLabel", "dataDisplayFeatures"].includes(currentPanel) && (
          <BodyContainer>
            <Container>
              <DataDisplay />
            </Container>
            <ColumnInspector />
            <CrossTab />
          </BodyContainer>
        )}

        {currentPanel === "selectTrainer" && (
          <BodyContainer>
            <ContainerFullWidth>
              <SelectTrainer />
            </ContainerFullWidth>
          </BodyContainer>
        )}

        {currentPanel === "trainModel" && (
          <BodyContainer>
            <ContainerFullWidth>
              <TrainModel />
            </ContainerFullWidth>
          </BodyContainer>
        )}

        {currentPanel === "results" && (
          <BodyContainer>
            <Container>
              <Results />
            </Container>
            {resultsPhase === 3 && <Predict />}
          </BodyContainer>
        )}

        {currentPanel === "saveModel" && (
          <BodyContainer>
            <ContainerFullWidth>
              <SaveModel saveTrainedModel={saveTrainedModel} />
            </ContainerFullWidth>
          </BodyContainer>
        )}

        <PanelButtons
          panelButtons={panelButtons}
          currentPanel={currentPanel}
          setCurrentPanel={setCurrentPanel}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
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
