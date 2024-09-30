import SwapLayoutDropdown from '@codebridge/components/SwapLayoutDropdown';
import React from 'react';

import Button from '@cdo/apps/componentLibrary/button';

import moduleStyles from './right-buttons.module.scss';
import darkModeStyles from '@codebridge/styles/dark-mode.module.scss';

interface RightButtonsProps {
  clearOutput: () => void;
}

const RightButtons: React.FunctionComponent<RightButtonsProps> = ({
  clearOutput,
}) => {
  return (
    <>
      <div className={moduleStyles.buttonContainer}>
        <Button
          isIconOnly
          color={'white'}
          icon={{iconStyle: 'solid', iconName: 'eraser'}}
          ariaLabel="clear console"
          onClick={clearOutput}
          size={'xs'}
          type={'tertiary'}
          className={darkModeStyles.iconOnlyTertiaryButton}
        />
        <SwapLayoutDropdown />
      </div>
    </>
  );
};

export default RightButtons;
