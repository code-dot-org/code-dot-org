import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import InstructionsView from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import moduleStyles from './styles/instructions.module.scss';

enum Panels {
  Instructions = 'Instructions',
  HelpAndTips = 'Help and Tips',
}

export const Instructions = React.memo(() => {
  const [currentPanel, setCurrentPanel] = useState(Panels.Instructions);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const renderHeaderButton = () => {
    return (
      <div>
        <Button
          icon={{
            iconStyle: 'solid',
            iconName: isDropdownOpen ? 'caret-up' : 'caret-down',
          }}
          isIconOnly
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          color={'black'}
          ariaLabel={'Instructions dropdown'}
          size={'xs'}
        />
      </div>
    );
  };

  const showCurrentPanel = () => {
    switch (currentPanel) {
      case Panels.Instructions:
        return <InstructionsView />;
      case Panels.HelpAndTips:
        return <div>Help and Tips</div>;
    }
  };

  return (
    <PanelContainer
      id="codebridge-instructions"
      headerContent={currentPanel}
      rightHeaderContent={renderHeaderButton()}
      className={moduleStyles.instructions}
    >
      {isDropdownOpen && (
        <form className={moduleStyles.dropdownContainer}>
          <ul>
            <li key={Panels.Instructions}>
              <Button
                color={'black'}
                onClick={() => setCurrentPanel(Panels.Instructions)}
                ariaLabel={Panels.Instructions}
                size={'xs'}
                text={Panels.Instructions}
                className={moduleStyles.dropdownItem}
              />
            </li>
            {/* <li key={Panels.HelpAndTips}>{Panels.HelpAndTips}</li> */}
          </ul>
        </form>
      )}
      {showCurrentPanel()}
    </PanelContainer>
  );
});
