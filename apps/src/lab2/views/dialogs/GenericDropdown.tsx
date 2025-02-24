import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect} from 'react';

import {useDialogControl} from './DialogControlContext';
import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type GenericDropdownProps = Pick<GenericDialogProps, 'title'> & {
  dropdownLabel: string;
  handleConfirm?: (Dropdown: string) => void;
  handleCancel?: () => void;
  selectedValue: SimpleDropdownProps['selectedValue'];
  items: SimpleDropdownProps['items'];
  message?: string;
  confirmText?: string;
  neutralText?: string;
  handleNeutral?: () => void;
};

type GenericDropdownBodyProps = {
  message?: string;
  dropdownLabel: string;
  selectedValue: SimpleDropdownProps['selectedValue'];
  items: SimpleDropdownProps['items'];
  handleInputChange: (newInput: string) => void;
};

const GenericDropdownBody: React.FunctionComponent<
  GenericDropdownBodyProps
> = ({message, dropdownLabel, handleInputChange, items, selectedValue}) => {
  return (
    <>
      {message && <BodyTwoText>{message}</BodyTwoText>}
      <SimpleDropdown
        name="dialog-dropdown"
        items={items}
        selectedValue={selectedValue}
        onChange={e => {
          handleInputChange(e.target.value);
        }}
        labelText={dropdownLabel}
      />
    </>
  );
};

const GenericDropdown: React.FunctionComponent<GenericDropdownProps> = ({
  title,
  message,
  handleConfirm,
  handleNeutral,
  handleCancel,
  selectedValue,
  items,
  dropdownLabel,
  confirmText,
  neutralText,
}) => {
  const {promiseArgs, setPromiseArgs} = useDialogControl();

  const handleInputChange = useCallback(
    (newInput: string | undefined) => {
      setPromiseArgs(newInput);
    },
    [setPromiseArgs]
  );

  useEffect(
    () => handleInputChange(selectedValue),
    [handleInputChange, selectedValue]
  );

  const buttons = {
    confirm: {
      text: confirmText,
      callback: () => handleConfirm?.(promiseArgs as string),
      disabled: false,
    },
    cancel: {callback: () => handleCancel?.()},
    ...(neutralText
      ? {neutral: {text: neutralText, callback: () => handleNeutral?.()}}
      : {}),
  };

  return (
    <GenericDialog
      title={title}
      bodyComponent={
        <GenericDropdownBody
          message={message}
          dropdownLabel={dropdownLabel}
          selectedValue={promiseArgs as string}
          items={items}
          handleInputChange={handleInputChange}
        />
      }
      buttons={buttons}
    />
  );
};

export default GenericDropdown;
