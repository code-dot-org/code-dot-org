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
    placeholder = 'Type to see results',
    debounceDelay = 300,
  }: {
    id: string;
    label: string;
    name: string;
    size: TextFieldProps['size'];
    className: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    value: string;
    fetchOptions: (value: string) => Promise<string[]>;
    errorMessage?: string;
    placeholder?: string;
    debounceDelay?: number;
  }) => {
    const skipApi = useRef(true);
    const listboxId = id;
    const [options, setOptions] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const debouncedValue = useDebounce(value, debounceDelay);

    const reset = useCallback(() => {
      // reset is called on every click outside of the input
      // check for the need to reset component before changing state
      if (!options.length) return;
      setOptions([]);
      setActiveIndex(-1);
    }, [options]);

    const containerRef = useOutsideClick<HTMLDivElement>(reset);

    useEffect(() => {
      // skip api call when component first mounts if value already exists
      // also skip when an option is selected and value updates with result
      if (skipApi.current) {
        skipApi.current = false;
        return;
      }
      if (debouncedValue && debouncedValue.length >= 3) {
        const fetchSuggestions = async () => {
          try {
            setLoading(true);
            const suggestedOptions = await fetchOptions(debouncedValue);
            setOptions(suggestedOptions);
            setActiveIndex(-1);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
        fetchSuggestions();
      }
    }, [debouncedValue, fetchOptions]);

    const handleSelectOption = useCallback(
      (option: string) => {
        skipApi.current = true;
        onChange({
          target: {
            name,
            value: option,
          },
        } as ChangeEvent<HTMLInputElement>);
        reset();
        containerRef.current?.querySelector('input')?.focus();
      },
      [containerRef, name, onChange, reset]
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
            }
            break;
          case 'Escape':
          case 'Tab':
            reset();
            break;
        }
      }
    };

    return (
      <div ref={containerRef} className={styles.autocompleteInputContainer}>
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
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={options.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-item-${activeIndex}` : undefined
          }
        />
        <FontAwesomeV6Icon
          iconName={loading ? 'spinner' : 'magnifying-glass'}
          animationType={loading ? 'spin' : undefined}
          aria-hidden={true}
        />
        {options.length > 0 && (
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
                onClick={() => handleSelectOption(option)}
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
