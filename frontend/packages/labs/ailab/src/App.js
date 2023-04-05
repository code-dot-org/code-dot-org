import React, { Component } from "react";
import PropTypes from "prop-types";
import SelectDataset from "./UIComponents/SelectDataset";
import DataDisplay from "./UIComponents/DataDisplay";
import ColumnInspector from "./UIComponents/ColumnInspector";
import DataCard from "./UIComponents/DataCard";
import TrainModel from "./UIComponents/TrainModel";
import GenerateResults from "./UIComponents/GenerateResults";
import Results from "./UIComponents/Results";
import Predict from "./UIComponents/Predict";
import SaveModel from "./UIComponents/SaveModel";
import ModelCard from "./UIComponents/ModelCard";
import { styles } from "./constants";
import { connect } from "react-redux";
import {
  getPanelButtons,
  setCurrentPanel,
  getTrainedModelDataToSave
} from "./redux";
import {
  isSaveComplete,
  shouldDisplaySaveStatus
} from "./helpers/navigationValidation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import I18n from "./i18n";

class PanelButtons extends Component {
  static propTypes = {
    panelButtons: PropTypes.object,
    currentPanel: PropTypes.string,
    setCurrentPanel: PropTypes.func,
    onContinue: PropTypes.func,
    startSaveTrainedModel: PropTypes.func,
    dataToSave: PropTypes.object,
    saveStatus: PropTypes.string,
    saveResponseData: PropTypes.object,
    isSaveComplete: PropTypes.func,
    shouldDisplaySaveStatus: PropTypes.func
  };

  onClickPrev = () => {
    this.props.setCurrentPanel(this.props.panelButtons.prev.panel);
  };

  onClickNext = () => {
    if (["continue", "finish"].includes(this.props.panelButtons.next.panel)) {
      this.props.onContinue();
    } else if (this.props.currentPanel === "saveModel") {
      this.props.startSaveTrainedModel(this.props.dataToSave);
    } else {
      this.props.setCurrentPanel(this.props.panelButtons.next.panel);
    }
  };

  localizedSaveMessage = saveStatus => {
    return I18n.t(`saveStatus_${saveStatus}`);
  };

  saveResponseDataMessage = saveResponseData => {
    // The list of known error types from share_filtering.rb.
    const errorTypes = ["email", "address", "phone", "profanity"];

    if (!saveResponseData) {
      return undefined;
    }

    const index = errorTypes.indexOf(saveResponseData.type);
    if (index !== -1) {
      return `(${index})`;
    } else {
      return undefined;
    }
  };

  render() {
    const { panelButtons, saveStatus, saveResponseData } = this.props;

    let loadSaveStatus = this.props.isSaveComplete(saveStatus) ? (
      this.localizedSaveMessage(saveStatus)
    ) : (
      <FontAwesomeIcon icon={faSpinner} />
    );

    let loadSaveResponseData = this.props.isSaveComplete(saveStatus)
      ? this.saveResponseDataMessage(saveResponseData)
      : undefined;

    return (
      <div style={styles.navigationButtonsContainer}>
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

        {this.props.shouldDisplaySaveStatus(saveStatus) &&
          this.props.currentPanel === "saveModel" && (
            <div style={styles.modelSaveMessage}>
              {loadSaveStatus}
              {loadSaveResponseData && (
                <div style={styles.modelSaveResponseDataMessage}>
                  {loadSaveResponseData}
                </div>
              )}
            </div>
          )}

        {panelButtons.next && (
          <div style={styles.nextButton}>
            <button
              type="button"
              id="uitest-continue-button"
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
    onContinue: PropTypes.func,
    resultsPhase: PropTypes.number,
    startSaveTrainedModel: PropTypes.func,
    dataToSave: PropTypes.object,
    saveStatus: PropTypes.string,
    saveResponseData: PropTypes.object,
    isSaveComplete: PropTypes.func,
    shouldDisplaySaveStatus: PropTypes.func
  };

  render() {
    const {
      panelButtons,
      currentPanel,
      setCurrentPanel,
      onContinue,
      resultsPhase,
      dataToSave,
      startSaveTrainedModel,
      saveStatus,
      saveResponseData
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

        {currentPanel === "trainModel" && (
          <BodyContainer>
            <ContainerFullWidth>
              <TrainModel />
            </ContainerFullWidth>
          </BodyContainer>
        )}

        {currentPanel === "generateResults" && (
          <BodyContainer>
            <ContainerFullWidth>
              <GenerateResults />
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

        {currentPanel === "modelSummary" && (
          <BodyContainer>
            <ContainerFullWidth>
              <ModelCard />
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
          saveStatus={saveStatus}
          saveResponseData={saveResponseData}
          isSaveComplete={isSaveComplete}
          shouldDisplaySaveStatus={shouldDisplaySaveStatus}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    panelButtons: getPanelButtons(state),
    currentPanel: state.currentPanel,
    resultsPhase: state.resultsPhase,
    dataToSave: getTrainedModelDataToSave(state),
    saveStatus: state.saveStatus,
    saveResponseData: state.saveResponseData
  }),
  dispatch => ({
    setCurrentPanel(panel) {
      dispatch(setCurrentPanel(panel));
    },
    isSaveComplete(state) {
      dispatch(isSaveComplete(state));
    },
    shouldDisplaySaveStatus(state) {
      dispatch(shouldDisplaySaveStatus(state));
    }
  })
)(App);
