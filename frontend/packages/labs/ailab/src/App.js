import React, { Component } from "react";
import PropTypes from "prop-types";
import SelectDataset from "./UIComponents/SelectDataset";
import DataDisplay from "./UIComponents/DataDisplay";
import ColumnInspector from "./UIComponents/ColumnInspector";
import DataCard from "./UIComponents/DataCard";
import TrainingSettings from "./UIComponents/TrainingSettings";
import TrainModel from "./UIComponents/TrainModel";
import Results from "./UIComponents/Results";
import Predict from "./UIComponents/Predict";
import SaveModel from "./UIComponents/SaveModel";
import { styles } from "./constants";
import { connect } from "react-redux";
import {
  getPanelButtons,
  setCurrentPanel,
  validationMessages,
  getTrainedModelDataToSave
} from "./redux";

class PanelButtons extends Component {
  static propTypes = {
    panelButtons: PropTypes.object,
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    onContinue: PropTypes.func,
    startSaveTrainedModel: PropTypes.func,
    dataToSave: PropTypes.object
  };

  onClickPrev = () => {
    this.props.setCurrentPanel(this.props.panelButtons.prev.panel);
  };

  onClickNext = () => {
    if (this.props.panelButtons.next.panel === "save") {
      this.props.startSaveTrainedModel(this.props.dataToSave);
    } else if (this.props.panelButtons.next.panel === "continue") {
      this.props.onContinue();
    } else {
      this.props.setCurrentPanel(this.props.panelButtons.next.panel);
    }
  };

  render() {
    const { panelButtons } = this.props;

    return (
      <div>
        {panelButtons.prev && (
          <div style={styles.previousButton}>
            <button
              type="button"
              style={{
                ...styles.navButton,
                ...(!panelButtons.prev.enabled
                  ? styles.disabledButton
                  : undefined)
              }}
              onClick={this.onClickPrev}
              disabled={!panelButtons.prev.enabled}
            >
              {panelButtons.prev.text}
            </button>
          </div>
        )}

        {panelButtons.next && (
          <div style={styles.nextButton}>
            <button
              type="button"
              style={{
                ...styles.navButton,
                ...(!panelButtons.next.enabled
                  ? styles.disabledButton
                  : undefined)
              }}
              onClick={this.onClickNext}
              disabled={!panelButtons.next.enabled}
            >
              {panelButtons.next.text}
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

const ContainerLeft = props => (
  <div style={{ ...styles.panelContainer, ...styles.panelContainerLeft }}>
    {props.children}
  </div>
);

ContainerLeft.propTypes = {
  children: PropTypes.node
};

const ContainerRight = props => (
  <div style={{ ...styles.panelContainer, ...styles.panelContainerRight }}>
    {props.children}
  </div>
);

ContainerRight.propTypes = {
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
    panelButtons: PropTypes.object,
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    validationMessages: PropTypes.object,
    onContinue: PropTypes.func,
    resultsPhase: PropTypes.number,
    startSaveTrainedModel: PropTypes.func,
    dataToSave: PropTypes.object
  };

  render() {
    const {
      panelButtons,
      currentPanel,
      setCurrentPanel,
      onContinue,
      resultsPhase,
      dataToSave,
      startSaveTrainedModel
    } = this.props;

    return (
      <div style={styles.app}>
        {currentPanel === "selectDataset" && (
          <BodyContainer>
            <ContainerLeft>
              <SelectDataset />
            </ContainerLeft>
            <ContainerRight>
              <DataCard />
            </ContainerRight>
          </BodyContainer>
        )}

        {["dataDisplayLabel", "dataDisplayFeatures"].includes(currentPanel) && (
          <BodyContainer>
            <ContainerLeft>
              <DataDisplay />
            </ContainerLeft>

            <ContainerRight>
              <ColumnInspector />
            </ContainerRight>
          </BodyContainer>
        )}

        {currentPanel === "trainingSettings" && (
          <BodyContainer>
            <ContainerFullWidth>
              <TrainingSettings />
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
            <ContainerLeft>
              <Results />
            </ContainerLeft>
            {resultsPhase === 1 && (
              <ContainerRight>
                <Predict />
              </ContainerRight>
            )}
          </BodyContainer>
        )}

        {currentPanel === "saveModel" && (
          <BodyContainer>
            <ContainerFullWidth>
              <SaveModel />
            </ContainerFullWidth>
          </BodyContainer>
        )}

        <PanelButtons
          panelButtons={panelButtons}
          currentPanel={currentPanel}
          setCurrentPanel={setCurrentPanel}
          onContinue={onContinue}
          startSaveTrainedModel={startSaveTrainedModel}
          dataToSave={dataToSave}
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
    resultsPhase: state.resultsPhase,
    dataToSave: getTrainedModelDataToSave(state)
  }),
  dispatch => ({
    setCurrentPanel(panel) {
      dispatch(setCurrentPanel(panel));
    }
  })
)(App);
