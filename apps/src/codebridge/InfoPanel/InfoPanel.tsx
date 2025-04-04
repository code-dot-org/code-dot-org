import Button from '@code-dot-org/component-library/button';
import ValidatedInstructionsView from '@codebridge/InfoPanel/ValidatedInstructions';
import React, {useEffect, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';
import {sendCodebridgeAnalyticsEvent} from '../utils/analyticsReporterHelper';

import ForTeachersOnly from './ForTeachersOnly';

import moduleStyles from './styles/info-panel.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

enum Panels {
  Instructions = 'Instructions',
  ForTeachersOnly = 'For Teachers Only',
}

const panelMap = {
  [Panels.Instructions]: ValidatedInstructionsView,
  [Panels.ForTeachersOnly]: ForTeachersOnly,
};

const panelProps = {
  [Panels.Instructions]: {},
  [Panels.ForTeachersOnly]: {},
};

const panelEventNames = {
  [Panels.Instructions]: EVENTS.CODEBRIDGE_INSTRUCTIONS_TOGGLE,
  [Panels.ForTeachersOnly]: EVENTS.CODEBRIDGE_FOR_TEACHERS_ONLY_TOGGLE,
};

const panelHeaderNames = {
  [Panels.Instructions]: codebridgeI18n.instructionsHeader(),
  [Panels.ForTeachersOnly]: codebridgeI18n.forTeachersOnlyHeader(),
};

interface InfoPanelProps {
  style?: React.CSSProperties;
  className?: string;
}

export const InfoPanel: React.FunctionComponent<InfoPanelProps> = ({
  style,
  className,
}) => {
  const {levelProperties} = useCodebridgeContext();
  const {
    mapReference,
    referenceLinks,
    teacherMarkdown,
    predictSettings,
    appName,
  } = levelProperties;
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const [currentPanel, setCurrentPanel] = useState(Panels.Instructions);
  const [currentPanelHeader, setCurrentPanelHeader] = useState(
    codebridgeI18n.instructionsHeader()
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [panelOptions, setPanelOptions] = useState<Panels[]>([
    Panels.Instructions,
  ]);
  const hasPredictSolution = predictSettings?.solution;

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
      setCurrentPanel(panelOptions[0]);
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
          color={'white'}
          ariaLabel={'Information panel dropdown'}
          size={'xs'}
          type={'tertiary'}
          className={darkModeStyles.tertiaryButton}
        />
      </div>
    ) : null;
  };

  const changePanel = (panel: Panels) => {
    if (panel !== currentPanel) {
      setCurrentPanel(panel);
      setCurrentPanelHeader(panelHeaderNames[panel]);
      sendCodebridgeAnalyticsEvent(panelEventNames[panel], appName);
    }
    setIsDropdownOpen(false);
  };

  const CurrentPanelView = panelMap[currentPanel];
  return (
    <div style={style} className={className}>
      <PanelContainer
        id="codebridge-info-panel"
        headerContent={currentPanelHeader}
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
                    color={'black'}
                    onClick={() => changePanel(panel)}
                    ariaLabel={panel}
                    size={'xs'}
                    text={panel}
                    className={moduleStyles.dropdownItem}
                  />
                </li>
              ))}
            </ul>
          </form>
        )}
        <CurrentPanelView {...panelProps[currentPanel]} />
      </PanelContainer>
    </div>
  );
};
