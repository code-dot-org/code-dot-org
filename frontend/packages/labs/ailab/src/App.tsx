import React from 'react';
import SelectDataset from './UIComponents/SelectDataset';
import DataDisplay from './UIComponents/DataDisplay';
import ColumnInspector from './UIComponents/ColumnInspector';
import DataCard from './UIComponents/DataCard';
import TrainModel from './UIComponents/TrainModel';
import GenerateResults from './UIComponents/GenerateResults';
import Results from './UIComponents/Results';
import Predict from './UIComponents/Predict';
import SaveModel from './UIComponents/SaveModel';
import ModelCard from './UIComponents/ModelCard';
import {styles} from './constants';
import {connect} from 'react-redux';
import {
  getPanelButtons,
  setCurrentPanel,
  getTrainedModelDataToSave,
  RootState,
} from './redux';
import {
  isSaveComplete,
  shouldDisplaySaveStatus,
} from './helpers/navigationValidation';
import {PrevNextButtons, ModelDataToSave, SaveResponseData} from './types';
import {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import I18n from './i18n';

interface PanelButtonsProps {
  panelButtons: PrevNextButtons;
  currentPanel: string;
  setCurrentPanel: (panel: string) => void;
  onContinue: () => void;
  startSaveTrainedModel: (dataToSave: ModelDataToSave) => void;
  dataToSave: ModelDataToSave;
  saveStatus: string;
  saveResponseData: SaveResponseData | undefined;
  isSaveComplete: (saveStatus: string) => boolean;
  shouldDisplaySaveStatus: (saveStatus: string) => boolean;
}

const PanelButtons = ({
  panelButtons,
  currentPanel,
  setCurrentPanel,
  onContinue,
  startSaveTrainedModel,
  dataToSave,
  saveStatus,
  saveResponseData,
  isSaveComplete: isSaveCompleteProp,
  shouldDisplaySaveStatus: shouldDisplaySaveStatusProp,
}: PanelButtonsProps) => {
  const onClickPrev = () => {
    if (panelButtons.prev) {
      setCurrentPanel(panelButtons.prev.panel);
    }
  };

  const onClickNext = () => {
    if (panelButtons.next) {
      if (['continue', 'finish'].includes(panelButtons.next.panel)) {
        onContinue();
      } else if (currentPanel === 'saveModel') {
        startSaveTrainedModel(dataToSave);
      } else {
        setCurrentPanel(panelButtons.next.panel);
      }
    }
  };

  const localizedSaveMessage = (saveStatus: string): string => {
    return I18n.t(`saveStatus_${saveStatus}`) ?? '';
  };

  const saveResponseDataMessage = (
    saveResponseData: SaveResponseData | undefined,
  ): string | undefined => {
    // The list of known error types from share_filtering.rb.
    const errorTypes = ['email', 'address', 'phone', 'profanity'];

    if (!saveResponseData) {
      return undefined;
    }

    const index = errorTypes.indexOf(saveResponseData.type || '');
    if (index !== -1) {
      return `(${index})`;
    } else {
      return undefined;
    }
  };

  const loadSaveStatus = isSaveCompleteProp(saveStatus) ? (
    localizedSaveMessage(saveStatus)
  ) : (
    <FontAwesomeIcon icon={faSpinner} />
  );

  const loadSaveResponseData = isSaveCompleteProp(saveStatus)
    ? saveResponseDataMessage(saveResponseData)
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
                : undefined),
            }}
            onClick={onClickPrev}
            disabled={!panelButtons.prev.enabled}
          >
            {panelButtons.prev.text}
          </button>
        </div>
      )}

      {shouldDisplaySaveStatusProp(saveStatus) &&
        currentPanel === 'saveModel' && (
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
                : undefined),
            }}
            onClick={onClickNext}
            disabled={!panelButtons.next.enabled}
          >
            {panelButtons.next.text}
          </button>
        </div>
      )}
    </div>
  );
};

interface BodyContainerProps {
  children: React.ReactNode;
}

const BodyContainer = ({children}: BodyContainerProps) => {
  return <div style={styles.bodyContainer}>{children}</div>;
};

interface ContainerLeftProps {
  children: React.ReactNode;
}

const ContainerLeft = ({children}: ContainerLeftProps) => {
  return (
    <div style={{...styles.panelContainer, ...styles.panelContainerLeft}}>
      {children}
    </div>
  );
};

interface ContainerRightProps {
  children: React.ReactNode;
}

const ContainerRight = ({children}: ContainerRightProps) => {
  return (
    <div style={{...styles.panelContainer, ...styles.panelContainerRight}}>
      {children}
    </div>
  );
};

interface ContainerFullWidthProps {
  children: React.ReactNode;
}

const ContainerFullWidth = ({children}: ContainerFullWidthProps) => {
  return <div style={styles.panelContainerFullWidth}>{children}</div>;
};

interface AppProps {
  panelButtons: PrevNextButtons;
  currentPanel: string;
  setCurrentPanel: (panel: string) => void;
  onContinue: () => void;
  resultsPhase: number | undefined;
  startSaveTrainedModel: (dataToSave: ModelDataToSave) => void;
  dataToSave: ModelDataToSave;
  saveStatus: string;
  saveResponseData: SaveResponseData | undefined;
}

const App = ({
  panelButtons,
  currentPanel,
  setCurrentPanel,
  onContinue,
  resultsPhase,
  startSaveTrainedModel,
  dataToSave,
  saveStatus,
  saveResponseData,
}: AppProps) => {
  return (
    <div style={styles.app}>
      {currentPanel === 'selectDataset' && (
        <BodyContainer>
          <ContainerLeft>
            <SelectDataset />
          </ContainerLeft>
          <ContainerRight>
            <DataCard />
          </ContainerRight>
        </BodyContainer>
      )}

      {['dataDisplayLabel', 'dataDisplayFeatures'].includes(currentPanel) && (
        <BodyContainer>
          <ContainerLeft>
            <DataDisplay />
          </ContainerLeft>

          <ContainerRight>
            <ColumnInspector />
          </ContainerRight>
        </BodyContainer>
      )}

      {currentPanel === 'trainModel' && (
        <BodyContainer>
          <ContainerFullWidth>
            <TrainModel />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'generateResults' && (
        <BodyContainer>
          <ContainerFullWidth>
            <GenerateResults />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'results' && (
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

      {currentPanel === 'saveModel' && (
        <BodyContainer>
          <ContainerFullWidth>
            <SaveModel />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'modelSummary' && (
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
};

export default connect(
  (state: RootState) => ({
    panelButtons: getPanelButtons(state),
    currentPanel: state.currentPanel,
    resultsPhase: state.resultsPhase,
    dataToSave: getTrainedModelDataToSave(state),
    saveStatus: state.saveStatus,
    saveResponseData: state.saveResponseData,
  }),
  (dispatch: Dispatch) => ({
    setCurrentPanel(panel: string) {
      dispatch(setCurrentPanel(panel));
    },
  }),
)(App);
