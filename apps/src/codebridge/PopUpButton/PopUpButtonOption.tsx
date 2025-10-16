import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from '@codebridge/FileBrowser/styles/filebrowser.module.scss';
import dropdownStyles from '@codebridge/styles/dropdown.module.scss';

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
  id?: string;
};

export const PopUpButtonOption = ({
  iconName,
  labelText,
  clickHandler,
  id,
}: PopUpButtonOptionProps) => {
  return (
    <div
      onClick={clickHandler}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (clickHandler) {
            clickHandler();
          }
        }
      }}
      className={classNames(
        dropdownStyles.dropdownItem,
        moduleStyles.dropdownItem
      )}
      role="button"
      tabIndex={0}
      id={id}
    >
      <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
      <div>{labelText}</div>
    </div>
  );
};
