import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import {GenericPromptArgs} from '@codebridge/codebridgeContext/types';
import debounce from 'lodash/debounce';
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {useDialogControl} from './DialogControlContext';
import GenericDialog, {
  defaultGetButtonCallback,
  GenericDialogProps,
  GetButtonCallbackArgs,
} from './GenericDialog';

import moduleStyles from './generic-prompt.module.scss';

const DEBOUNCE_TIME_OUT = 300;

export type GenericPromptProps = Pick<
  GenericDialogProps,
  'title' | 'useModal' | 'buttons'
> & {
  handleConfirm?: (prompt: string) => void;
  handleCancel?: () => void;
  value?: string;
  validateInput?: (
    prompt: string,
    dropdownValue?: string
  ) => {text: string; type: 'error' | 'warning'} | undefined;
  requiresPrompt?: boolean;
  message?: string;
  messageMargin?: boolean;
  textFieldProps?: Partial<ComponentProps<typeof TextField>>;
  dropdownProps?: Partial<ComponentProps<typeof SimpleDropdown>>;
};

/**
 * Generic Prompt dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */

type GenericPromptBodyProps = {
  message?: string;
  prompt: string;
  handleInputChange: (newInput: string) => void;
  handleDropdownChange?: (newValue: string) => void;
  errorMessage?: string;
  messageMargin?: boolean;
  textFieldProps?: Partial<ComponentProps<typeof TextField>>;
  dropdownProps?: Partial<ComponentProps<typeof SimpleDropdown>>;
};

const GenericPromptBody: React.FunctionComponent<GenericPromptBodyProps> = ({
  message,
  prompt,
  handleInputChange,
  handleDropdownChange,
  errorMessage,
  messageMargin = true,
  textFieldProps,
  dropdownProps,
}) => {
  return (
    <>
      {message && (
        <BodyTwoText
          className={messageMargin ? moduleStyles.messageMargin : ''}
        >
          {message}
        </BodyTwoText>
      )}
      <div className={moduleStyles.inputContainer}>
        <TextField
          name="prompt-field"
          label={textFieldProps?.label || ''}
          value={prompt}
          onChange={e => handleInputChange(e.target.value)}
          errorMessage={errorMessage}
          color="gray"
          id="uitest-prompt-field"
          {...textFieldProps}
        />
        {dropdownProps?.items && (
          <SimpleDropdown
            name="prompt-dropdown"
            className={moduleStyles.dropdown}
            labelText={dropdownProps.labelText || ''}
            items={dropdownProps.items}
            selectedValue={dropdownProps.selectedValue!}
            onChange={e => handleDropdownChange?.(e.target.value)}
            color="gray"
            {...dropdownProps}
          />
        )}
      </div>
    </>
  );
};

const GenericPrompt: React.FunctionComponent<GenericPromptProps> = ({
  title,
  message,
  messageMargin,
  handleConfirm,
  handleCancel,
  value,
  validateInput = () => undefined,
  requiresPrompt = true,
  useModal = false,
  buttons,
  textFieldProps,
  dropdownProps,
}) => {
  const {promiseArgs, setPromiseArgs} = useDialogControl();
  const hasDropdown = !!dropdownProps?.items?.length;
  const defaultPromptArgs: GenericPromptArgs = {
    textField: value || '',
    dropdown: dropdownProps?.selectedValue,
  };
  const promptArgs = hasDropdown
    ? ((promiseArgs ?? defaultPromptArgs) as GenericPromptArgs)
    : null;
  const prompt = hasDropdown
    ? promptArgs!.textField
    : ((promiseArgs ?? (value || '')) as string);
  const dropdownValue = promptArgs?.dropdown;
  const [validationMessage, setValidationMessage] = useState<
    {text: string; type: 'error' | 'warning'} | undefined
  >(undefined);

  const debouncedErrorHandler = useMemo(() => {
    return debounce((newInput: string, currentDropdownValue?: string) => {
      setValidationMessage(validateInput(newInput, currentDropdownValue));
    }, DEBOUNCE_TIME_OUT);
  }, [setValidationMessage, validateInput]);

  const handleInputChange = useCallback(
    (newInput: string) => {
      if (hasDropdown) {
        setPromiseArgs({...promptArgs, textField: newInput});
      } else {
        setPromiseArgs(newInput);
      }
      // if the user has typed something in and we do not currently have an error,
      // then use the debounced handler with the delay.
      //
      //That'll prevent the error from popping up immediately and giving a chance to type.
      // Otherwise, if there is no input or the user already has an error, then we want to
      // validate immediately (in an attempt to clear the error), so use the non-debounced version.
      if (newInput.length && !validationMessage?.text?.length) {
        debouncedErrorHandler(newInput, dropdownValue);
      } else {
        setValidationMessage(validateInput(newInput, dropdownValue));
      }
    },
    [
      setPromiseArgs,
      hasDropdown,
      promptArgs,
      dropdownValue,
      validationMessage?.text?.length,
      debouncedErrorHandler,
      validateInput,
    ]
  );

  const handleDropdownChange = useCallback(
    (newValue: string) => {
      setPromiseArgs({...promptArgs, dropdown: newValue});
      setValidationMessage(validateInput(prompt, newValue));
    },
    [setPromiseArgs, promptArgs, validateInput, prompt]
  );

  // fire the handleInputChange callback once upon loading. This'll populate the given prompt into the promiseArgs
  // as well as calling validateInput on it to confirm it's acceptable.'
  useEffect(() => handleInputChange(prompt), []); // eslint-disable-line react-hooks/exhaustive-deps

  // we're going to hand in a custom buttonCallback getter to the generic dialog. We don't need to worry about memoizing this,
  // since it'll get memoized up in the parent component. When the user clicks the confirm button, we're just going to re-validate
  // the prompt. If if produces a validation error, display it and bow out. Otherwise, just proceed with the default handler.
  //
  // This will prevent the user from rapidly typing an invalid input and then clicking `OK` before the debounced error handler has
  // had a chance to catch up.
  const getButtonCallback =
    ({closeDialog, closeType, callback, disabled}: GetButtonCallbackArgs) =>
    () => {
      if (closeType === 'confirm') {
        const validationError = validateInput(prompt, dropdownValue);
        if (validationError) {
          setValidationMessage(validationError);
          return;
        }
      }
      const defaultCallback = defaultGetButtonCallback({
        closeDialog,
        closeType,
        callback,
        disabled,
      });

      return defaultCallback();
    };

  const hasError = validationMessage?.type === 'error';

  return (
    <GenericDialog
      title={title}
      useModal={useModal}
      bodyComponent={
        <GenericPromptBody
          message={message}
          messageMargin={messageMargin}
          prompt={prompt}
          handleInputChange={handleInputChange}
          handleDropdownChange={handleDropdownChange}
          errorMessage={validationMessage?.text}
          textFieldProps={textFieldProps}
          dropdownProps={{
            ...dropdownProps,
            selectedValue: dropdownValue,
          }}
        />
      }
      buttons={{
        confirm: {
          ...buttons?.confirm,
          callback: () => handleConfirm?.(prompt),
          disabled: hasError || (requiresPrompt && !prompt.length),
        },
        cancel: {
          ...buttons?.cancel,
          callback: () => handleCancel?.(),
        },
      }}
      getButtonCallback={getButtonCallback}
    />
  );
};

export default GenericPrompt;
