import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from '@codebridge/FileBrowser/styles/filebrowser.module.scss';
import darkModeStyles from '@codebridge/styles/dark-mode.module.scss';

/*
  This component provides a default layout & styling for an item in the PopUpButton.
  It should be used as a child or ancestor of PopUpButton. It may be wrapped in another
  component to provide additional functionality, such as FileUploader. In that
  case, the click handler can be handled by the parent component and not passed
  in to this component.
*/

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
