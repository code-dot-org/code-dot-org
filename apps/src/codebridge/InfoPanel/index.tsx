import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import InstructionsView from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import HelpAndTips from './HelpAndTips';

import moduleStyles from './styles/info-panel.module.scss';

enum Panels {
  Instructions = 'Instructions',
  HelpAndTips = 'Help and Tips',
}

const panelMap = {
  [Panels.Instructions]: InstructionsView,
  [Panels.HelpAndTips]: HelpAndTips,
};

export const InfoPanel = React.memo(() => {
  const mapReference = useAppSelector(
    state => state.lab.levelProperties?.mapReference
  );
  const referenceLinks = useAppSelector(
    state => state.lab.levelProperties?.referenceLinks
  );
  const [currentPanel, setCurrentPanel] = useState(Panels.Instructions);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const renderHeaderButton = () => {
    return panelOptions().length > 1 ? (
      <div>
        <Button
          icon={{
            iconStyle: 'solid',
            iconName: isDropdownOpen ? 'caret-up' : 'caret-down',
          }}
          isIconOnly
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          color={'black'}
          ariaLabel={'Information panel dropdown'}
          size={'xs'}
        />
      </div>
    ) : null;
  };

  const panelOptions = () => {
    // For now, always include Instructions panel.
    // TODO: support hiding this panel completely if there are no instructions.
    const panelOptions = [Panels.Instructions];
    if (mapReference || referenceLinks) {
      panelOptions.push(Panels.HelpAndTips);
    }
    return panelOptions;
  };

  const changePanel = (panel: Panels) => {
    setCurrentPanel(panel);
    setIsDropdownOpen(false);
  };

  const CurrentPanelView = panelMap[currentPanel];

  return (
    <PanelContainer
      id="codebridge-info-panel"
      headerContent={currentPanel}
      rightHeaderContent={renderHeaderButton()}
      className={moduleStyles.infoPanel}
    >
      {isDropdownOpen && (
        <form className={moduleStyles.dropdownContainer}>
          <ul>
            {panelOptions().map(panel => {
              return (
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
              );
            })}
          </ul>
        </form>
      )}
      <CurrentPanelView />
    </PanelContainer>
  );
});
