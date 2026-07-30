import type {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {
  faChartLine,
  faSpinner,
  faTable,
  faUpload,
  faVial,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import {Algorithms, styles} from './constants';
import {reportPanelView} from './helpers/metrics';
import {
  getNavigationTabs,
  isSaveComplete,
  shouldShowNavigationTabs,
  shouldDisplaySaveStatus,
} from './helpers/navigationValidation';
import {deepEqual, shallowEqual, useAppDispatch, useAppSelector} from './hooks';
import I18n from './i18n';
import {
  getPanelButtons,
  resetToAlgorithmSelection,
  saveModel,
  setCurrentPanel,
} from './redux';
import type {
  AlgorithmId,
  DataDisplayView,
  InstructionsKey,
  NavigationTab,
  Panel,
  PrevNextButtons,
  SaveResponseData,
  SaveTrainedModel,
} from './types';
import ColumnInspector from './UIComponents/ColumnInspector';
import DataCard from './UIComponents/DataCard';
import DataDisplay from './UIComponents/DataDisplay';
import ExportModel from './UIComponents/ExportModel';
import GenerateResults from './UIComponents/GenerateResults';
import ModelCard from './UIComponents/ModelCard';
import Predict from './UIComponents/Predict';
import Results from './UIComponents/Results';
import SelectAlgorithm from './UIComponents/SelectAlgorithm';
import SelectDataset from './UIComponents/SelectDataset';
import TrainModel from './UIComponents/TrainModel';

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
      } else if (currentPanel === 'exportModel') {
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
        currentPanel === 'exportModel' && (
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

interface NavigationTabsProps {
  navigationTabs: NavigationTab[];
  currentPanel: Panel;
  selectedAlgorithm: AlgorithmId | undefined;
  onClickAlgorithm: () => void;
  setCurrentPanel: (panel: Panel) => void;
}

function navigationTabId(tab: NavigationTab): string {
  return `ailab-${tab.id}-tab`;
}

const navigationTabIcons: Record<NavigationTab['id'], IconDefinition> = {
  dataset: faTable,
  train: faChartLine,
  test: faVial,
  export: faUpload,
};

const algorithmNameKeys: Record<AlgorithmId, string> = {
  [Algorithms.KNN]: 'algorithmKnnName',
  [Algorithms.DECISION_TREE]: 'algorithmDecisionTreeName',
};

const NavigationTabs = ({
  navigationTabs,
  currentPanel,
  selectedAlgorithm,
  onClickAlgorithm,
  setCurrentPanel,
}: NavigationTabsProps) => {
  const selectedAlgorithmName = selectedAlgorithm
    ? I18n.t(algorithmNameKeys[selectedAlgorithm])
    : undefined;

  const onClickTab = (tab: NavigationTab) => {
    if (tab.enabled && tab.panel && tab.panel !== currentPanel) {
      setCurrentPanel(tab.panel);
    }
  };

  const onKeyDownTab = (
    event: KeyboardEvent<HTMLButtonElement>,
    tab: NavigationTab,
  ) => {
    const enabledTabs = navigationTabs.filter(navigationTab => {
      return navigationTab.enabled && navigationTab.panel;
    });
    const tabIndex = enabledTabs.findIndex(
      navigationTab => navigationTab.id === tab.id,
    );

    if (tabIndex === -1) {
      return;
    }

    let targetTab: NavigationTab | undefined;
    if (event.key === 'ArrowRight') {
      targetTab = enabledTabs[(tabIndex + 1) % enabledTabs.length];
    } else if (event.key === 'ArrowLeft') {
      targetTab =
        enabledTabs[(tabIndex + enabledTabs.length - 1) % enabledTabs.length];
    } else if (event.key === 'Home') {
      targetTab = enabledTabs[0];
    } else if (event.key === 'End') {
      targetTab = enabledTabs[enabledTabs.length - 1];
    }

    if (targetTab?.panel) {
      event.preventDefault();
      setCurrentPanel(targetTab.panel);
      window.requestAnimationFrame(() => {
        document.getElementById(navigationTabId(targetTab))?.focus();
      });
    }
  };

  return (
    <nav
      aria-label={I18n.t('navigationTabsAriaLabel')}
      style={styles.navigationTabsRail}
    >
      <div style={styles.navigationAlgorithmContainer}>
        {selectedAlgorithmName && (
          <button
            type="button"
            style={styles.navigationAlgorithmButton}
            onClick={onClickAlgorithm}
            aria-label={I18n.t('navigationAlgorithmRestartAriaLabel', {
              algorithm: selectedAlgorithmName,
            })}
          >
            <span style={styles.navigationAlgorithmPrefix}>
              {I18n.t('navigationAlgorithmLabel')}
            </span>
            <span style={styles.navigationAlgorithmName}>
              {selectedAlgorithmName}
            </span>
          </button>
        )}
      </div>
      <div role="tablist" style={styles.navigationTabs}>
        {navigationTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            id={navigationTabId(tab)}
            role="tab"
            aria-selected={tab.selected}
            aria-controls="ailab-active-panel"
            tabIndex={tab.enabled ? 0 : -1}
            disabled={!tab.enabled}
            onClick={() => onClickTab(tab)}
            onKeyDown={event => onKeyDownTab(event, tab)}
            style={{
              ...styles.navigationTab,
              ...(tab.selected ? styles.navigationTabSelected : undefined),
              ...(!tab.enabled ? styles.navigationTabDisabled : undefined),
            }}
          >
            <span
              aria-hidden="true"
              style={styles.navigationTabIconIndicator}
            >
              <FontAwesomeIcon
                icon={navigationTabIcons[tab.id]}
                style={styles.navigationTabIcon}
              />
            </span>
            <span
              style={{
                ...styles.navigationTabLabel,
                ...(tab.selected
                  ? styles.navigationTabLabelSelected
                  : undefined),
              }}
            >
              {tab.text}
            </span>
          </button>
        ))}
      </div>
      <div aria-hidden="true" style={styles.navigationTabsRailSpacer} />
    </nav>
  );
};

interface AlgorithmResetDialogProps {
  algorithmName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const AlgorithmResetDialog = ({
  algorithmName,
  onCancel,
  onConfirm,
}: AlgorithmResetDialogProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = 'algorithm-reset-dialog-title';
  const descriptionId = 'algorithm-reset-dialog-description';

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const onKeyDownDialog = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = [
        cancelButtonRef.current,
        confirmButtonRef.current,
      ].filter((button): button is HTMLButtonElement => !!button);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDownDialog);
    return () => document.removeEventListener('keydown', onKeyDownDialog);
  }, [onCancel]);

  return (
    <div style={styles.dialogScrim}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={styles.confirmDialog}
      >
        <div id={titleId} style={styles.confirmDialogTitle}>
          {I18n.t('algorithmResetDialogTitle')}
        </div>
        <p id={descriptionId} style={styles.confirmDialogText}>
          {I18n.t('algorithmResetDialogMessage', {algorithm: algorithmName})}
        </p>
        <div style={styles.confirmDialogActions}>
          <button
            type="button"
            ref={cancelButtonRef}
            style={styles.confirmDialogCancelButton}
            onClick={onCancel}
          >
            {I18n.t('algorithmResetDialogCancel')}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            style={styles.confirmDialogConfirmButton}
            onClick={onConfirm}
          >
            {I18n.t('algorithmResetDialogConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface BodyContainerProps {
  children: ReactNode;
  hasNavigationTabs: boolean;
  labelledBy?: string;
}

const BodyContainer = ({
  children,
  hasNavigationTabs,
  labelledBy,
}: BodyContainerProps) => {
  return (
    <div
      id={hasNavigationTabs ? 'ailab-active-panel' : undefined}
      role={hasNavigationTabs ? 'tabpanel' : undefined}
      aria-labelledby={labelledBy}
      style={
        hasNavigationTabs
          ? styles.bodyContainerWithNavigationTabs
          : styles.bodyContainer
      }
    >
      {children}
    </div>
  );
};

interface ContainerLeftProps {
  children: ReactNode;
}

const ContainerLeft = ({children}: ContainerLeftProps) => {
  return (
    <div style={{...styles.panelContainer, ...styles.panelContainerLeft}}>
      {children}
    </div>
  );
};

interface ContainerRightProps {
  children: ReactNode;
}

const ContainerRight = ({children}: ContainerRightProps) => {
  return (
    <div style={{...styles.panelContainer, ...styles.panelContainerRight}}>
      {children}
    </div>
  );
};

interface ContainerFullWidthProps {
  children: ReactNode;
}

const ContainerFullWidth = ({children}: ContainerFullWidthProps) => {
  return <div style={styles.panelContainerFullWidth}>{children}</div>;
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
  const [datasetViewMode, setDatasetViewMode] =
    useState<DataDisplayView>('table');
  const [showAlgorithmResetDialog, setShowAlgorithmResetDialog] =
    useState(false);
  const panelButtons = useAppSelector(getPanelButtons, panelButtonsEqual);
  const navigationTabs = useAppSelector(getNavigationTabs, deepEqual);
  const currentPanel = useAppSelector(state => state.currentPanel);
  const selectedAlgorithm = useAppSelector(state => state.selectedAlgorithm);
  const resultsPhase = useAppSelector(state => state.resultsPhase);
  const saveStatus = useAppSelector(state => state.saveStatus);
  const saveResponseData = useAppSelector(state => state.saveResponseData);
  const instructionsKey = useAppSelector(state => state.instructionsKey);
  const showOverlay = useAppSelector(state => state.showOverlay);
  const showNavigationTabs = shouldShowNavigationTabs(currentPanel);
  const selectedNavigationTab = navigationTabs.find(tab => tab.selected);
  const bodyContainerProps = {
    hasNavigationTabs: showNavigationTabs,
    labelledBy: selectedNavigationTab
      ? navigationTabId(selectedNavigationTab)
      : undefined,
  };
  const dataDisplayPanelOpen = [
    'dataDisplayDataset',
    'dataDisplayLabel',
    'dataDisplayFeatures',
  ].includes(currentPanel);
  const datasetCardViewOpen =
    currentPanel === 'dataDisplayDataset' && datasetViewMode === 'cards';
  const selectedAlgorithmName = selectedAlgorithm
    ? I18n.t(algorithmNameKeys[selectedAlgorithm])
    : undefined;

  const confirmAlgorithmReset = () => {
    setShowAlgorithmResetDialog(false);
    setDatasetViewMode('table');
    dispatch(resetToAlgorithmSelection());
  };

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
    <div style={styles.app}>
      {showNavigationTabs && (
        <NavigationTabs
          navigationTabs={navigationTabs}
          currentPanel={currentPanel}
          selectedAlgorithm={selectedAlgorithm}
          onClickAlgorithm={() => setShowAlgorithmResetDialog(true)}
          setCurrentPanel={panel => dispatch(setCurrentPanel(panel))}
        />
      )}

      {showAlgorithmResetDialog && selectedAlgorithmName && (
        <AlgorithmResetDialog
          algorithmName={selectedAlgorithmName}
          onCancel={() => setShowAlgorithmResetDialog(false)}
          onConfirm={confirmAlgorithmReset}
        />
      )}

      {currentPanel === 'selectAlgorithm' && (
        <BodyContainer {...bodyContainerProps}>
          <ContainerFullWidth>
            <SelectAlgorithm />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'selectDataset' && (
        <BodyContainer {...bodyContainerProps}>
          <ContainerLeft>
            <SelectDataset />
          </ContainerLeft>
          <ContainerRight>
            <DataCard />
          </ContainerRight>
        </BodyContainer>
      )}

      {dataDisplayPanelOpen && (
        <BodyContainer {...bodyContainerProps}>
          {datasetCardViewOpen ? (
            <ContainerFullWidth>
              <DataDisplay
                showStatement={false}
                showViewToggle={true}
                viewMode={datasetViewMode}
                setViewMode={setDatasetViewMode}
              />
            </ContainerFullWidth>
          ) : (
            <>
              <ContainerLeft>
                <DataDisplay
                  showStatement={currentPanel !== 'dataDisplayDataset'}
                  showViewToggle={currentPanel === 'dataDisplayDataset'}
                  viewMode={
                    currentPanel === 'dataDisplayDataset'
                      ? datasetViewMode
                      : 'table'
                  }
                  setViewMode={setDatasetViewMode}
                />
              </ContainerLeft>

              <ContainerRight>
                <ColumnInspector />
              </ContainerRight>
            </>
          )}
        </BodyContainer>
      )}

      {currentPanel === 'trainModel' && (
        <BodyContainer {...bodyContainerProps}>
          <ContainerFullWidth>
            <TrainModel />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'generateResults' && (
        <BodyContainer {...bodyContainerProps}>
          <ContainerFullWidth>
            <GenerateResults />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'results' && (
        <BodyContainer {...bodyContainerProps}>
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

      {currentPanel === 'exportModel' && (
        <BodyContainer {...bodyContainerProps}>
          <ContainerFullWidth>
            <ExportModel />
          </ContainerFullWidth>
        </BodyContainer>
      )}

      {currentPanel === 'modelSummary' && (
        <BodyContainer {...bodyContainerProps}>
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
