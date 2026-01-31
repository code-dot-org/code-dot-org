import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField, {
  TextFieldProps,
} from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {useDebounce} from '@cdo/apps/util/hooks/useDebounce';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';

import styles from './AutocompleteInput.module.scss';

export const AutocompleteInput = memo(
  ({
    label,
    name,
    size,
    className,
    onChange,
    value,
    fetchOptions,
    errorMessage,
    id,
    onKeyDown,
    'aria-label': ariaLabel,
    onBlur,
    onSelect,
    onEnter,
    hideIcon = false,
    placeholder = 'Type to see results',
    debounceDelay = 300,
  }: {
    id: string;
    label?: string;
    name: string;
    size: TextFieldProps['size'];
    className: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    value: string;
    fetchOptions: (value: string) => Promise<string[]>;
    errorMessage?: string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    'aria-label'?: string;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onSelect?: (option: string) => void;
    onEnter?: (value: string) => void;
    hideIcon?: boolean;
    placeholder?: string;
    debounceDelay?: number;
  }) => {
    const skipApi = useRef(true);
    const lastRequestedValue = useRef<string | null>(null);
    const requestIdRef = useRef(0);
    const isFocusedRef = useRef(false);
    const suppressOptionsRef = useRef(false);
    const listboxId = id;
    const [options, setOptions] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const debouncedValue = useDebounce(value, debounceDelay);

    const reset = useCallback(() => {
      // reset is called on every click outside of the input
      // check for the need to reset component before changing state
      if (!options.length) return;
      setOptions([]);
      setActiveIndex(-1);
    }, [options]);

    const closeOptions = useCallback(() => {
      requestIdRef.current += 1;
      setOptions([]);
      setActiveIndex(-1);
    }, []);

    const containerRef = useOutsideClick<HTMLDivElement>(reset);

    const fetchSuggestions = useCallback(
      async (valueToFetch: string) => {
        if (lastRequestedValue.current === valueToFetch) {
          return;
        }
        const requestId = (requestIdRef.current += 1);
        lastRequestedValue.current = valueToFetch;
        try {
          setLoading(true);
          const suggestedOptions = await fetchOptions(valueToFetch);
          if (requestId !== requestIdRef.current || !isFocusedRef.current) {
            return;
          }
          setOptions(suggestedOptions);
          setActiveIndex(-1);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      [fetchOptions]
    );

    const resetAfterSubmit = useCallback(
      (submittedValue: string) => {
        skipApi.current = true;
        lastRequestedValue.current = submittedValue;
        closeOptions();
      },
      [closeOptions]
    );

    useEffect(() => {
      // skip api call when component first mounts if value already exists
      // also skip when an option is selected and value updates with result
      if (skipApi.current) {
        skipApi.current = false;
        return;
      }
      if (suppressOptionsRef.current) {
        if (value && value !== lastRequestedValue.current) {
          suppressOptionsRef.current = false;
        } else {
          return;
        }
      }
      if (!value || value.length < 3) {
        reset();
        return;
      }
      if (debouncedValue && debouncedValue.length >= 3) {
        fetchSuggestions(debouncedValue);
      }
    }, [debouncedValue, fetchSuggestions, reset, value]);

    const handleSelectOption = useCallback(
      (option: string) => {
        skipApi.current = true;
        onChange({
          target: {
            name,
            value: option,
          },
        } as ChangeEvent<HTMLInputElement>);
        onSelect?.(option);
        lastRequestedValue.current = option;
        closeOptions();
        containerRef.current?.querySelector('input')?.focus();
      },
      [containerRef, name, onChange, onSelect, closeOptions]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (options.length > 0) {
        const {key} = e;
        switch (key) {
          case 'ArrowDown':
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, options.length - 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
            break;
          case 'Enter':
          case ' ':
            if (activeIndex >= 0) {
              e.preventDefault();
              handleSelectOption(options[activeIndex]);
            } else if (key === 'Enter' && onEnter) {
              e.preventDefault();
              suppressOptionsRef.current = true;
              onEnter(value);
              resetAfterSubmit(value);
            }
            break;
          case 'Escape':
          case 'Tab':
            closeOptions();
            break;
        }
        if (key === 'Enter') {
          closeOptions();
          containerRef.current?.querySelector('input')?.blur();
        }
      }
      if (!e.defaultPrevented && onKeyDown) {
        onKeyDown(e);
      }
    };

    const handleFocus = () => {
      isFocusedRef.current = true;
      setIsFocused(true);
      if (value.length >= 3) {
        fetchSuggestions(value);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      setIsFocused(false);
      suppressOptionsRef.current = false;
      onBlur?.(event);
      reset();
    };

    return (
      <div
        ref={containerRef}
        className={classNames(styles.autocompleteInputContainer, {
          [styles.hideIcon]: hideIcon,
        })}
      >
        <TextField
          name={name}
          label={label}
          size={size}
          onChange={onChange}
          value={value}
          className={className}
          errorMessage={errorMessage}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          aria-label={ariaLabel}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={options.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-item-${activeIndex}` : undefined
          }
        />
        {!hideIcon && (
          <FontAwesomeV6Icon
            iconName={loading ? 'spinner' : 'magnifying-glass'}
            animationType={loading ? 'spin' : undefined}
            aria-hidden={true}
          />
        )}
        {isFocused && options.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className={classNames(styles.optionList, {
              [styles.keyboardNav]: activeIndex >= 0,
            })}
          >
            {options.map((option, index) => (
              <li
                key={option}
                className={classNames(styles.optionItem, {
                  [styles.active]: activeIndex === index,
                })}
                onMouseDown={event => {
                  event.preventDefault();
                  handleSelectOption(option);
                }}
                id={`${listboxId}-item-${index}`}
                role="option"
                aria-selected={activeIndex === index}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
