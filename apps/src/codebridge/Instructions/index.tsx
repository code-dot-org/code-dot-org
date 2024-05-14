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
      // <DropdownButton color={'neutralDark'} size={'small'}>
      //   <a onClick={() => setCurrentPanel(Panels.Instructions)}>Instructions</a>
      //   <a onClick={() => setCurrentPanel(Panels.HelpAndTips)}>Help and Tips</a>
      // </DropdownButton>
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

        {isDropdownOpen && (
          <ul className={moduleStyles.dropdown}>
            <li key={Panels.Instructions}>
              <Button
                color={'black'}
                onClick={() => setCurrentPanel(Panels.Instructions)}
                ariaLabel={Panels.Instructions}
                size={'xs'}
                text={Panels.Instructions}
              />
            </li>
            {/* <li key={Panels.HelpAndTips}>{Panels.HelpAndTips}</li> */}
          </ul>
        )}
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
      {showCurrentPanel()}
    </PanelContainer>
  );
});
