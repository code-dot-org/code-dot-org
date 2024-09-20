import SwapLayoutDropdown from '@codebridge/components/SwapLayoutDropdown';
import React from 'react';

import Button from '@cdo/apps/componentLibrary/button';

import moduleStyles from './right-buttons.module.scss';

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
          color={'black'}
          icon={{iconStyle: 'solid', iconName: 'eraser'}}
          ariaLabel="clear console"
          onClick={clearOutput}
          size={'xs'}
        />
        <SwapLayoutDropdown />
      </div>
    </>
  );
};

export default RightButtons;
