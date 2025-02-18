import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import React, {useCallback, useEffect, useState} from 'react';

import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

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
  validateInput?: (option: string) => string | undefined;
};

type GenericDropdownBodyProps = {
  message?: string;
  dropdownLabel: string;
  selectedValue: SimpleDropdownProps['selectedValue'];
  items: SimpleDropdownProps['items'];
  handleInputChange: (newInput: string) => void;
  errorMessage?: string;
};

const GenericDropdownBody: React.FunctionComponent<
  GenericDropdownBodyProps
> = ({
  message,
  dropdownLabel,
  handleInputChange,
  items,
  selectedValue,
  errorMessage,
}) => {
  return (
    <>
      {message && <BodyTwoText>{message}</BodyTwoText>}
      <SimpleDropdown
        name="dialog-dropdown"
        items={items}
        selectedValue={selectedValue}
        onChange={e => {
          console.log('OC : ', e.target.value, e);
          handleInputChange(e.target.value);
        }}
        labelText={dropdownLabel}
        errorMessage={errorMessage}
      />
    </>
  );
};

const GenericDropdown: React.FunctionComponent<GenericDropdownProps> = ({
  title,
  message,
  handleConfirm,
  handleCancel,
  selectedValue,
  items,
  dropdownLabel,
  confirmText,
  neutralText,
  handleNeutral,
  validateInput = () => undefined,
}) => {
  const {promiseArgs, setPromiseArgs} = useDialogControl();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const handleInputChange = useCallback(
    (newInput: string | undefined) => {
      setPromiseArgs(newInput);
      setErrorMessage(validateInput(newInput ?? ''));
    },
    [setPromiseArgs, validateInput]
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
          errorMessage={errorMessage}
        />
      }
      buttons={buttons}
    />
  );
};

export default GenericDropdown;
