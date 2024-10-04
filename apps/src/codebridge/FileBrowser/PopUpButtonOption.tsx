import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './styles/filebrowser.module.scss';
import darkModeStyles from '@codebridge/styles/dark-mode.module.scss';

type PopUpButtonOptionProps = {
  iconName: string;
  labelText: string;
  clickHandler?: () => void;
};

export const PopUpButtonOption = ({
  iconName,
  labelText,
  clickHandler,
}: PopUpButtonOptionProps) => {
  return (
    <div
      onClick={clickHandler}
      className={classNames(
        darkModeStyles.dropdownItem,
        moduleStyles.dropdownItem
      )}
    >
      <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
      <div>{labelText}</div>
    </div>
  );
};
