import ValidatedInstructionsView from '@codebridge/InfoPanel/ValidatedInstructions';
import React, {useEffect, useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {sendCodebridgeAnalyticsEvent} from '../utils/analyticsReporterHelper';

import ForTeachersOnly from './ForTeachersOnly';
import HelpAndTips from './HelpAndTips';

import moduleStyles from './styles/info-panel.module.scss';
import darkModeStyles from '@codebridge/styles/dark-mode.module.scss';

enum Panels {
  Instructions = 'Instructions',
  HelpAndTips = 'Help and Tips',
  ForTeachersOnly = 'For Teachers Only',
}

const panelMap = {
  [Panels.Instructions]: ValidatedInstructionsView,
  [Panels.HelpAndTips]: HelpAndTips,
  [Panels.ForTeachersOnly]: ForTeachersOnly,
};

const panelProps = {
  [Panels.Instructions]: {},
  [Panels.HelpAndTips]: {},
  [Panels.ForTeachersOnly]: {},
};

const panelEventNames = {
  [Panels.Instructions]: EVENTS.CODEBRIDGE_INSTRUCTIONS_TOGGLE,
  [Panels.HelpAndTips]: EVENTS.CODEBRIDGE_HELP_TIPS_TOGGLE,
  [Panels.ForTeachersOnly]: EVENTS.CODEBRIDGE_FOR_TEACHERS_ONLY_TOGGLE,
};

export const InfoPanel = React.memo(() => {
  const mapReference = useAppSelector(
    state => state.lab.levelProperties?.mapReference
  );
  const referenceLinks = useAppSelector(
    state => state.lab.levelProperties?.referenceLinks
  );
  const teacherMarkdown = useAppSelector(
    state => state.lab.levelProperties?.teacherMarkdown
  );
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const [currentPanel, setCurrentPanel] = useState(Panels.Instructions);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [panelOptions, setPanelOptions] = useState<Panels[]>([
    Panels.Instructions,
  ]);
  const hasPredictSolution = useAppSelector(
    state => !!state.lab.levelProperties?.predictSettings?.solution
  );
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  useEffect(() => {
    // For now, always include Instructions panel.
    // TODO: support hiding this panel completely if there are no instructions.
    const options = [Panels.Instructions];
    if (isUserTeacher && (teacherMarkdown || hasPredictSolution)) {
      options.push(Panels.ForTeachersOnly);
    }
    if (mapReference || referenceLinks) {
      options.push(Panels.HelpAndTips);
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
          className={darkModeStyles.iconOnlyTertiaryButton}
        />
      </div>
    ) : null;
  };

  const changePanel = (panel: Panels) => {
    if (panel !== currentPanel) {
      setCurrentPanel(panel);
      sendCodebridgeAnalyticsEvent(panelEventNames[panel], appName);
    }
    setIsDropdownOpen(false);
  };

  const CurrentPanelView = panelMap[currentPanel];

  return (
    <PanelContainer
      id="codebridge-info-panel"
      headerContent={currentPanel}
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
  );
});
