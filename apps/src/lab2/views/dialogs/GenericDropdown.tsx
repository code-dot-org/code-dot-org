import React, {useCallback, useEffect} from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';
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
          console.log('OC : ', e.target.value, e);
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
  handleCancel,
  selectedValue,
  items,
  dropdownLabel,
}) => {
  const {promiseArgs, setPromiseArgs} = useDialogControl();

  const handleInputChange = useCallback(
    (newInput: string | undefined) => {
      setPromiseArgs(newInput);
    },
    [setPromiseArgs]
  );

  useEffect(() => handleInputChange(selectedValue), []); // eslint-disable-line react-hooks/exhaustive-deps

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
      buttons={{
        confirm: {
          callback: () => handleConfirm?.(promiseArgs as string),
          disabled: false,
        },
        cancel: {callback: () => handleCancel?.()},
      }}
    />
  );
};

export default GenericDropdown;
