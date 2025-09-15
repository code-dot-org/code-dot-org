import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '@code-dot-org/component-library/formFieldWrapper';
import Tags from '@code-dot-org/component-library/tags';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';

import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';

import styles from './MultiSelectInput.module.scss';

export type OptionId = string | number;

export interface Option {
  id: OptionId;
  searchText: string[];
  label: string;
  secondaryLabel?: string;
}

export const isOption = (value: unknown): value is Option =>
  value !== null &&
  typeof value === 'object' &&
  'label' in value &&
  'id' in value;

export const MultiSelectInput: React.FC<{
  name: string;
  label: string;
  options: Option[];
  selectedOptions: Option[];
  setSelectedOptions: (selectedOptions: Option[]) => void;
  id?: string;
  size?: FormFieldWrapperProps['size'];
  className?: string;
  placeholder?: string;
  emptyStateMessage?: string;
  errorMessage?: string;
}> = ({
  name,
  label,
  options,
  selectedOptions,
  setSelectedOptions,
  errorMessage,
  size,
  className,
  id = 'multiselect',
  placeholder = 'Filter options',
  emptyStateMessage = 'No results found',
}) => {
  const [searchText, setSearchText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredOptionId, setHoveredOptionId] = useState<OptionId | null>(null);

  const reset = () => {
    setMenuOpen(false);
    setSearchText('');
    setActiveIndex(-1);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useOutsideClick<HTMLDivElement>(reset);
  const optionRefs = useRef<Map<OptionId, HTMLLIElement>>(new Map());

  const filteredOptions = useMemo(
    () =>
      options.filter(option =>
        option.searchText.some(text =>
          text.toLowerCase().includes(searchText.toLowerCase())
        )
      ),
    [options, searchText]
  );

  const optionsMap = useMemo(
    () => new Map(options.map(option => [option.id, option])),
    [options]
  );

  const activeDescendant = useMemo(() => {
    if (activeIndex >= 0 && filteredOptions[activeIndex]) {
      return `${id}-option-${filteredOptions[activeIndex].id}`;
    }
    if (filteredOptions.length === 1) {
      return `${id}-option-${filteredOptions[0].id}`;
    }
  }, [activeIndex, filteredOptions, id]);

  // scrolls option into view
  // activeIndex is set when navigating the option menu
  // via keyboard interaction
  useEffect(() => {
    if (activeIndex >= 0 && filteredOptions[activeIndex] && menuOpen) {
      const activeElement = optionRefs.current.get(
        filteredOptions[activeIndex].id ?? ''
      );
      activeElement?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  }, [activeIndex, filteredOptions, menuOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.currentTarget;
    setSearchText(value);
    if (!menuOpen && value) {
      setMenuOpen(true);
    }
    if (!value) {
      setActiveIndex(-1);
    }
  };

  const handleToggleOption = (option: Option) => {
    setSearchText('');
    setActiveIndex(-1);
    setSelectedOptions(
      selectedOptions.some(opt => opt.id === option.id)
        ? selectedOptions.filter(opt => opt.id !== option.id)
        : [...selectedOptions, option]
    );
  };

  const handleRemoveOption = (option: Option) => {
    setSelectedOptions(selectedOptions.filter(opt => opt.id !== option.id));
  };

  const handleClearAll = (
    e?:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.KeyboardEvent<HTMLButtonElement>
  ) => {
    e?.stopPropagation();
    setSelectedOptions([]);
    reset();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const {key} = e;

    // Open menu on ArrowDown/ArrowUp if closed and there are options
    if (!menuOpen && (key === 'ArrowDown' || key === 'ArrowUp')) {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        setMenuOpen(true);
        if (key === 'ArrowDown') {
          setActiveIndex(0);
        } else {
          setActiveIndex(filteredOptions.length - 1);
        }
        return;
      }
    }

    // Handle navigation and selection if menu is open
    if (menuOpen) {
      switch (key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev =>
            Math.min(prev + 1, filteredOptions.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          // when filtering results in a single option, Enter selects it
          if (activeIndex < 0 && searchText && filteredOptions.length === 1) {
            handleToggleOption(filteredOptions[0]);
          }
        // fallthrough is intentional
        // Space and Enter act the same when an option is active
        // eslint-disable-next-line no-fallthrough
        case ' ':
          if (activeIndex >= 0 && filteredOptions[activeIndex]) {
            handleToggleOption(filteredOptions[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          reset();
          break;
        case 'Tab':
          reset();
          break;
      }
    }

    if (key === 'Backspace' && searchText === '') {
      if (selectedOptions.length > 0) {
        handleRemoveOption(selectedOptions[selectedOptions.length - 1]);
      } else {
        reset();
      }
    }
  };

  const isOptionSelected = useCallback(
    (id: OptionId) => selectedOptions.some(opt => opt.id === id),
    [selectedOptions]
  );

  const isOptionHovered = useCallback(
    (id: OptionId) => hoveredOptionId === id && activeIndex < 0,
    [hoveredOptionId, activeIndex]
  );

  const anyOptionsSelected = useMemo(
    () => selectedOptions.length > 0,
    [selectedOptions]
  );

  const anyOptionInvalid = useMemo(
    () => selectedOptions.some(opt => !optionsMap.has(opt.id)),
    [selectedOptions, optionsMap]
  );

  return (
    <div ref={wrapperRef}>
      <FormFieldWrapper
        label={label}
        className={classNames(styles.label, className)}
        id={`${id}-label`}
        size={size}
        errorMessage={anyOptionInvalid ? 'Invalid option' : errorMessage}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          if (!menuOpen) setMenuOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div
          className={classNames(styles.container, {
            [styles.focused]: isFocused,
            [styles.invalid]: anyOptionInvalid,
          })}
          aria-haspopup="listbox"
        >
          <div className={styles.tagsAndSearchContainer}>
            {selectedOptions.map(option => {
              const {id, label} = option;
              const invalid = !optionsMap.has(id);

              return (
                <Tags
                  key={id}
                  className={classNames(styles.tag, {
                    [styles.invalid]: invalid,
                  })}
                  size="s"
                  tagsList={[
                    {
                      label,
                      type: 'closable',
                      onClose: e => {
                        e?.stopPropagation();
                        e?.preventDefault();
                        handleRemoveOption(option);
                      },
                      key: id,
                      ariaLabel: `Remove ${label}`,
                    },
                  ]}
                />
              );
            })}
            <input
              className={styles.searchInput}
              ref={inputRef}
              id={id}
              name={name}
              placeholder={placeholder}
              value={searchText}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleInputKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-controls={`${id}-listbox`}
              aria-expanded={menuOpen}
              aria-activedescendant={activeDescendant}
              aria-labelledby={`${id}-label`}
              autoComplete="new-password"
            />
          </div>
          {anyOptionsSelected && (
            <CloseButton
              className={styles.clearAllButton}
              onClick={handleClearAll}
              aria-label="Clear all selected options"
            />
          )}

          {menuOpen && (
            <ul
              className={classNames(styles.multiSelectMenu, {
                [styles.keyboardNav]: activeIndex >= 0,
              })}
              id={`${id}-listbox`}
              role="listbox"
              aria-multiselectable="true"
              aria-labelledby={`${id}-label`}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, i) => {
                  const selected = isOptionSelected(option.id);
                  const optionFocused =
                    activeIndex === i || filteredOptions.length === 1;
                  const optionHovered = isOptionHovered(option.id);
                  const optionHtmlId = `${id}-option-${option.id}`;

                  return (
                    <li
                      key={option.id}
                      id={optionHtmlId}
                      className={classNames(styles.option, {
                        [styles.focused]: optionFocused,
                      })}
                      onMouseDown={e => {
                        e.preventDefault();
                        handleToggleOption(option);
                        inputRef.current?.focus();
                      }}
                      onMouseEnter={() => setHoveredOptionId(option.id)}
                      onMouseLeave={() => setHoveredOptionId(null)}
                      role="option"
                      aria-selected={selected}
                      ref={el =>
                        el
                          ? optionRefs.current.set(option.id, el)
                          : optionRefs.current.delete(option.id)
                      }
                    >
                      <div className={styles.optionLabelText}>
                        <BodyThreeText>{option.label}</BodyThreeText>
                        {option.secondaryLabel && (
                          <BodyThreeText>{option.secondaryLabel}</BodyThreeText>
                        )}
                      </div>

                      {selected && (
                        <FontAwesomeV6Icon
                          iconName={
                            optionHovered || optionFocused ? 'close' : 'check'
                          }
                          aria-hidden
                        />
                      )}
                    </li>
                  );
                })
              ) : (
                <li>
                  <BodyThreeText className={styles.emptyState}>
                    {emptyStateMessage}
                  </BodyThreeText>
                </li>
              )}
            </ul>
          )}
        </div>
      </FormFieldWrapper>
    </div>
  );
};
