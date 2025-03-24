import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import Tags from '@code-dot-org/component-library/tags';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';

import styles from './styles.module.scss';

export type OptionId = string | number;

export interface Option {
  id: OptionId;
  searchText: string[];
  label: string;
  secondaryLabel?: string;
}

export const MultiSelectInput: React.FC<{
  label: string;
  options: Option[];
  selectedOptions: OptionId[];
  setSelectedOptions: (selectedOptions: OptionId[]) => void;
  id?: string;
  placeholder?: string;
  emptyStateMessage?: string;
}> = ({
  label,
  options,
  selectedOptions,
  setSelectedOptions,
  id = 'multiselect',
  placeholder = 'Filter options',
  emptyStateMessage = 'No results found',
}) => {
  const [searchText, setSearchText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedOptionId, setFocusedOptionId] = useState<OptionId | null>(null);
  const [hoveredOptionId, setHoveredOptionId] = useState<OptionId | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<OptionId, HTMLDivElement>>(new Map());

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

  // sets focus and scrolls option into view
  // focusedOptionId is set when navigating the option menu
  // via keyboard interaction
  useEffect(() => {
    if (focusedOptionId !== null && menuOpen) {
      const activeElement = optionRefs.current.get(focusedOptionId ?? '');
      if (activeElement instanceof HTMLDivElement) {
        activeElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        activeElement.focus();
      }
    }
  }, [focusedOptionId, menuOpen]);

  // clear the focusedOptionId when the option menu is closed
  useEffect(() => {
    if (!menuOpen) {
      setFocusedOptionId(null);
    }
  }, [menuOpen]);

  // listen for clicks outside the component to close the option menu
  // removes the listener when the component unmounts
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        closeMenu({skipFocus: true});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (!menuOpen) {
      setMenuOpen(true);
    } else if (!e.target.value) {
      closeMenu({skipFocus: true});
    }
  };

  const handleToggleOption = (optionId: OptionId) => {
    setSelectedOptions(
      selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId]
    );
  };

  const handleRemoveOption = (optionId: OptionId) => {
    setSelectedOptions(selectedOptions.filter(id => id !== optionId));
  };

  const handleClearAll = () => {
    setSelectedOptions([]);
    closeMenu();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        if (menuOpen && searchText && filteredOptions.length > 0) {
          const option = filteredOptions[0];
          handleToggleOption(option.id);
          setSearchText('');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setMenuOpen(true);
        setFocusedOptionId(filteredOptions[0]?.id ?? null);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setMenuOpen(true);
        setFocusedOptionId(
          filteredOptions[filteredOptions.length - 1]?.id ?? null
        );
        break;
      case 'Tab':
        if (!anyOptionsSelected) {
          closeMenu({skipFocus: true});
        }
        break;
      case 'Escape':
        closeMenu();
        break;
      case 'Backspace':
        if (searchText === '' && selectedOptions[selectedOptions.length - 1]) {
          handleToggleOption(selectedOptions[selectedOptions.length - 1]);
        }
        break;
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filteredOptions.length) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedOptionId(prev =>
          prev === null
            ? filteredOptions[0]?.id ?? null
            : filteredOptions[
                Math.min(
                  filteredOptions.findIndex(option => option.id === prev) + 1,
                  filteredOptions.length - 1
                )
              ]?.id ?? null
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedOptionId(prev =>
          prev === null
            ? filteredOptions[filteredOptions.length - 1]?.id ?? null
            : filteredOptions[
                Math.max(
                  filteredOptions.findIndex(option => option.id === prev) - 1,
                  0
                )
              ]?.id ?? null
        );
        break;
      // intentional fallthrough case
      case 'Escape':
      case 'Tab':
        closeMenu({skipFocus: e.key === 'Tab'});
        break;
    }
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    id: OptionId
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleToggleOption(id);
    }
  };

  const closeMenu = (options?: {skipFocus?: boolean}) => {
    setMenuOpen(false);
    setSearchText('');
    setFocusedOptionId(null);
    if (!options?.skipFocus) {
      inputRef.current?.focus();
    }
  };

  const isOptionSelected = useCallback(
    (id: OptionId) => selectedOptions.includes(id),
    [selectedOptions]
  );

  const isOptionFocused = useCallback(
    (id: OptionId) => focusedOptionId === id,
    [focusedOptionId]
  );

  const isOptionHovered = useCallback(
    (id: OptionId) => hoveredOptionId === id,
    [hoveredOptionId]
  );

  const anyOptionsSelected = useMemo(
    () => selectedOptions.length > 0,
    [selectedOptions]
  );

  const activeDescendant = useMemo(
    () => (focusedOptionId ? `${id}-option-${focusedOptionId}` : undefined),
    [focusedOptionId, id]
  );

  return (
    <div ref={wrapperRef}>
      <FormFieldWrapper
        label={label}
        className={styles.label}
        id={`${id}-label`}
        onClick={e => {
          // prevent label's native click event and stop propagation
          e.preventDefault();
          e.stopPropagation();
          if (!menuOpen) {
            inputRef.current?.focus();
          }
        }}
      >
        <div
          className={classNames(styles.container, {
            [styles.focused]: isFocused,
          })}
          role="combobox"
          aria-controls={`${id}-listbox`}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
        >
          <div className={styles.tagsAndSearchContainer}>
            {selectedOptions.map(id => {
              const option = optionsMap.get(id);
              if (!option) {
                return null;
              }

              return (
                <Tags
                  key={id}
                  className={styles.tag}
                  size="s"
                  tagsList={[
                    {
                      label: option.label,
                      type: 'closable',
                      onClose: () => {
                        handleRemoveOption(option.id);
                      },
                      key: option.id,
                      ariaLabel: `Remove ${option.label}`,
                    },
                  ]}
                />
              );
            })}
            <input
              className={styles.searchInput}
              ref={inputRef}
              type="search"
              id={id}
              placeholder={placeholder}
              value={searchText}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onClick={() => setMenuOpen(true)}
              onKeyDown={handleInputKeyDown}
              aria-autocomplete="list"
              aria-controls={`${id}-listbox`}
              aria-labelledby={`${id}-label`}
              aria-label="filter options"
              autoComplete="off"
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
            <div
              className={styles.multiSelectMenu}
              id={`${id}-listbox`}
              role="listbox"
              aria-multiselectable
              aria-activedescendant={activeDescendant}
              aria-labelledby={`${id}-label`}
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, i) => {
                  const selected = isOptionSelected(option.id);
                  const optionFocused = isOptionFocused(option.id);
                  const optionHovered = isOptionHovered(option.id);
                  const optionId = `${id}-option-${option.id}`;

                  return (
                    <div
                      key={option.id}
                      id={optionId}
                      className={classNames(styles.option, {
                        [styles.hover]: i === 0 && searchText.length,
                      })}
                      onClick={() => handleToggleOption(option.id)}
                      onKeyDown={e => handleOptionKeyDown(e, option.id)}
                      onMouseEnter={() => setHoveredOptionId(option.id)}
                      onMouseLeave={() => setHoveredOptionId(null)}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
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
                    </div>
                  );
                })
              ) : (
                <BodyThreeText className={styles.emptyState}>
                  {emptyStateMessage}
                </BodyThreeText>
              )}
            </div>
          )}
        </div>
      </FormFieldWrapper>
    </div>
  );
};
