import Button from '@code-dot-org/component-library/button';
import React, {useEffect, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import lab2I18n from '@cdo/apps/lab2/locale';
import {
  setIsValidating,
  setHasValidated,
} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {isUsingResourcePanel} from '@cdo/apps/lab2/utils';
import ForTeachersOnly from '@cdo/apps/lab2/views/components/Instructions/ForTeachersOnly';
import InstructionsV2 from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {UserLevelInteractions} from '@cdo/generated-scripts/sharedConstants';

import {useCodebridgeContext} from '../codebridgeContext';
import CodebridgeRegistry from '../CodebridgeRegistry';
import {getSystemMessage} from '../Console/MessageHelpers';
import {useCodebridgeSettings} from '../hooks/useCodebridgeSettings';
import {sendCodebridgeAnalyticsEvent} from '../utils/analyticsReporterHelper';

import moduleStyles from './styles/info-panel.module.scss';

enum Panels {
  Instructions = 'Instructions',
  ForTeachersOnly = 'For Teachers Only',
}

const panelEventNames = {
  [Panels.Instructions]: EVENTS.CODEBRIDGE_INSTRUCTIONS_TOGGLE,
  [Panels.ForTeachersOnly]: EVENTS.CODEBRIDGE_FOR_TEACHERS_ONLY_TOGGLE,
};

const panelNames = {
  [Panels.Instructions]: lab2I18n.instructions(),
  [Panels.ForTeachersOnly]: lab2I18n.forTeachersOnly(),
};

interface InfoPanelProps {
  style?: React.CSSProperties;
  className?: string;
}

export const InfoPanel: React.FunctionComponent<InfoPanelProps> = ({
  style,
  className,
}) => {
  const {
    levelProperties,
    onRun,
    onStop,
    AiTutor2ResponseView,
    hiddenContextCallback,
    startSources,
    aiTutorSystemPromptSettings,
    aiTutorMultimodalEnabled,
    aiTutorChatButtonData,
  } = useCodebridgeContext();
  const {
    mapReference,
    referenceLinks,
    teacherMarkdown,
    predictSettings,
    id: levelId,
    appName,
    isProjectLevel,
  } = levelProperties;
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const [currentPanel, setCurrentPanel] = useState(Panels.Instructions);
  const [currentPanelName, setCurrentPanelName] = useState(
    panelNames[Panels.Instructions]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [panelOptions, setPanelOptions] = useState<Panels[]>([
    Panels.Instructions,
  ]);
  const hasPredictSolution = predictSettings?.solution;

  const dispatch = useAppDispatch();
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const isValidating = useAppSelector(state => state.lab2System.isValidating);
  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);
  const hasLoadedEnvironment = useAppSelector(
    state => state.lab2System.loadedCodeEnvironment
  );
  const useResourcePanel = isUsingResourcePanel(
    appName,
    isProjectLevel || false
  );
  const settings = useCodebridgeSettings();

  useEffect(() => {
    // For now, always include Instructions panel.
    // TODO: support hiding this panel completely if there are no instructions.
    const options = [Panels.Instructions];
    if (isUserTeacher && (teacherMarkdown || hasPredictSolution)) {
      options.push(Panels.ForTeachersOnly);
    }
    setPanelOptions(options);
    // Close the dropdown if we change levels.
    setIsDropdownOpen(false);
  }, [
    isUserTeacher,
    mapReference,
    referenceLinks,
    teacherMarkdown,
    hasPredictSolution,
  ]);

  useEffect(() => {
    // If we change levels and were on a panel that no longer exists,
    // switch to the first panel that does exist.
    if (!panelOptions.includes(currentPanel)) {
      const newPanel = panelOptions[0];
      setCurrentPanel(newPanel);
      setCurrentPanelName(panelNames[newPanel]);
    }
  }, [currentPanel, panelOptions]);

  const renderHeaderButton = () => {
    return panelOptions.length > 1 ? (
      <div>
        <Button
          icon={{
            iconStyle: 'solid',
            iconName: isDropdownOpen ? 'caret-up' : 'caret-down',
          }}
          isIconOnly
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          ariaLabel={lab2I18n.informationPanelDropdown()}
          aria-expanded={isDropdownOpen}
          size={'xs'}
          type={'tertiary'}
          color={'black'}
        />
      </div>
    ) : null;
  };

  const changePanel = (panel: Panels) => {
    if (panel !== currentPanel) {
      setCurrentPanel(panel);
      setCurrentPanelName(panelNames[panel]);
      sendCodebridgeAnalyticsEvent(panelEventNames[panel], appName);
    }
    setIsDropdownOpen(false);
  };

  const handleValidate = () => {
    if (onRun) {
      dispatch(setIsValidating(true));
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_VALIDATE_CLICK, appName);
      logUserLevelInteraction({
        levelId: levelId,
        scriptId: scriptId,
        interaction: UserLevelInteractions.click_validate,
      });
      onRun(true, dispatch, source).finally(() =>
        dispatch(setIsValidating(false))
      );
      dispatch(setHasValidated(true));
    } else {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemMessage(codebridgeI18n.cannotTest(), appName)
        );
    }
  };

  const handleStopValidation = () => {
    if (onStop) {
      onStop();
      dispatch(setIsValidating(false));
    } else {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemMessage(codebridgeI18n.cannotStop(), appName)
        );
      dispatch(setIsValidating(false));
    }
  };

  if (useResourcePanel) {
    return (
      <div style={style} className={className}>
        <ResourcePanel
          isRunning={isRunning}
          hasRun={hasRun}
          hasEdited={hasEdited}
          validationSettings={{
            onValidate: handleValidate,
            onStopValidation: handleStopValidation,
            isValidating,
            isValidateDisabled: !hasLoadedEnvironment || isRunning,
          }}
          AiTutor2ResponseView={AiTutor2ResponseView}
          className={moduleStyles.instructionsContainer}
          headerClassName={moduleStyles.infoPanelHeader}
          levelProperties={levelProperties}
          requireRun={appName === 'pythonlab'}
          hiddenContextCallback={hiddenContextCallback}
          settings={settings}
          versionHistoryProps={{startSources}}
          aiTutorSystemPromptSettings={aiTutorSystemPromptSettings}
          aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
          aiTutorChatButtonData={aiTutorChatButtonData}
          isValidationTourEnabled={appName === 'pythonlab'}
          isOnboardingTourEnabled={appName === 'pythonlab'}
        />
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      <PanelContainer
        id="codebridge-info-panel"
        headerContent={currentPanelName}
        rightHeaderContent={renderHeaderButton()}
        className={moduleStyles.infoPanel}
        headerClassName={moduleStyles.infoPanelHeader}
      >
        {isDropdownOpen && (
          <form className={moduleStyles.dropdownContainer}>
            <ul>
              {panelOptions.map(panel => (
                <li key={panel}>
                  <Button
                    color={'white'}
                    onClick={() => changePanel(panel)}
                    ariaLabel={panelNames[panel]}
                    size={'xs'}
                    text={panelNames[panel]}
                    className={moduleStyles.dropdownItem}
                  />
                </li>
              ))}
            </ul>
          </form>
        )}
        {currentPanel === Panels.Instructions ? (
          <InstructionsV2
            isRunning={isRunning}
            hasRun={hasRun}
            hasEdited={hasEdited}
            validationSettings={{
              onValidate: handleValidate,
              onStopValidation: handleStopValidation,
              isValidating,
              isValidateDisabled: !hasLoadedEnvironment || isRunning,
            }}
            AiTutor2ResponseView={AiTutor2ResponseView}
            className={moduleStyles.instructionsContainer}
            levelProperties={levelProperties}
            requireRun={appName === 'pythonlab'}
          />
        ) : (
          <ForTeachersOnly levelProperties={levelProperties} />
        )}
      </PanelContainer>
    </div>
  );
};
