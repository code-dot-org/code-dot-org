import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import {type CSSProperties, type ReactNode, useEffect} from 'react';

import {colors} from './constants';
import {reportPanelView} from './helpers/metrics';
import {
  isSaveComplete,
  shouldDisplaySaveStatus,
} from './helpers/navigationValidation';
import {shallowEqual, useAppDispatch, useAppSelector} from './hooks';
import I18n from './i18n';
import {getPanelButtons, saveModel, setCurrentPanel} from './redux';
import type {
  InstructionsKey,
  Panel,
  PrevNextButtons,
  SaveResponseData,
  SaveTrainedModel,
} from './types';
import DataCard from './UIComponents/DataCard';
import DataDisplay from './UIComponents/DataDisplay';
import GenerateResults from './UIComponents/GenerateResults';
import ModelCard from './UIComponents/ModelCard';
import Results from './UIComponents/Results';
import SaveModel from './UIComponents/SaveModel';
import SelectDataset from './UIComponents/SelectDataset';
import TrainModel from './UIComponents/TrainModel';
import TrainPanel from './UIComponents/TrainPanel';

import styles from './app.module.scss';

const colorVariables = {
  '--ailab-feature': colors.feature,
  '--ailab-label': colors.label,
  '--ailab-background': colors.background,
  '--ailab-teal': colors.teal,
} as CSSProperties;

interface PanelButtonsProps {
  panelButtons: PrevNextButtons;
  currentPanel: Panel;
  setCurrentPanel: (panel: Panel) => void;
  onContinue: () => void;
  startSaveTrainedModel: () => void;
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
        startSaveTrainedModel();
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
    <div className={styles.navigation}>
      {panelButtons.prev && (
        <div className={styles.previous}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onClickPrev}
            disabled={!panelButtons.prev.enabled}
          >
            {panelButtons.prev.text}
          </button>
        </div>
      )}

      {shouldDisplaySaveStatusProp(saveStatus) &&
        currentPanel === 'saveModel' && (
          <div className={styles.saveMessage}>
            {loadSaveStatus}
            {loadSaveResponseData && (
              <div className={styles.saveResponseData}>
                {loadSaveResponseData}
              </div>
            )}
          </div>
        )}

      {panelButtons.next && (
        <div className={styles.next}>
          <button
            type="button"
            id="uitest-continue-button"
            className={styles.navButton}
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
  children: ReactNode;
  flush?: boolean;
}

const BodyContainer = ({children, flush}: BodyContainerProps) => {
  return (
    <div className={classNames(styles.body, {[styles.flushBody]: flush})}>
      {children}
    </div>
  );
};

interface ContainerLeftProps {
  children: ReactNode;
}

const ContainerLeft = ({children}: ContainerLeftProps) => {
  return <div className={styles.column}>{children}</div>;
};

interface ContainerRightProps {
  children: ReactNode;
}

const ContainerRight = ({children}: ContainerRightProps) => {
  return (
    <div className={classNames(styles.column, styles.rightColumn)}>
      {children}
    </div>
  );
};

interface ContainerFullWidthProps {
  children: ReactNode;
}

const ContainerFullWidth = ({children}: ContainerFullWidthProps) => {
  return (
    <div className={classNames(styles.column, styles.fullWidth)}>
      {children}
    </div>
  );
};

export interface AppProps {
  /** Called when advancing to the next level. */
  onContinue: () => void;
  /** Persist a trained model; invokes `callback` with the save result. */
  saveTrainedModel: SaveTrainedModel;
  /** Optional callback invoked when the instructions key changes. */
  setInstructionsKey?: (
    key: InstructionsKey,
    options: {showOverlay?: boolean} | null,
  ) => void;
}

// getPanelButtons builds a fresh {prev, next} each call (and reads I18n for
// button text), so compare its two sub-objects to avoid rerendering on a new
// reference with unchanged contents.
const panelButtonsEqual = (a: PrevNextButtons, b: PrevNextButtons) =>
  shallowEqual(a.prev, b.prev) && shallowEqual(a.next, b.next);

const App = ({onContinue, saveTrainedModel, setInstructionsKey}: AppProps) => {
  const dispatch = useAppDispatch();
  const panelButtons = useAppSelector(getPanelButtons, panelButtonsEqual);
  const currentPanel = useAppSelector(state => state.currentPanel);
  const saveStatus = useAppSelector(state => state.saveStatus);
  const saveResponseData = useAppSelector(state => state.saveResponseData);
  const instructionsKey = useAppSelector(state => state.instructionsKey);
  const showOverlay = useAppSelector(state => state.showOverlay);

  // Notify the consumer of instructions key changes when they occur.
  useEffect(() => {
    if (instructionsKey) {
      setInstructionsKey?.(instructionsKey, {showOverlay});
    }
  }, [instructionsKey, showOverlay]);

  // Report panel view on every panel change.
  useEffect(() => {
    reportPanelView(currentPanel);
  }, [currentPanel]);

  return (
    <div className={styles.app} style={colorVariables}>
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
        <BodyContainer flush>
          <ContainerLeft>
            <DataDisplay />
          </ContainerLeft>

          <ContainerRight>
            <TrainPanel />
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
          <ContainerFullWidth>
            <Results />
          </ContainerFullWidth>
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
        setCurrentPanel={panel => dispatch(setCurrentPanel(panel))}
        onContinue={onContinue}
        startSaveTrainedModel={() => dispatch(saveModel(saveTrainedModel))}
        saveStatus={saveStatus}
        saveResponseData={saveResponseData}
        isSaveComplete={isSaveComplete}
        shouldDisplaySaveStatus={shouldDisplaySaveStatus}
      />
    </div>
  );
};

export default App;
