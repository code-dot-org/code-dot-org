import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState, useCallback} from 'react';

import {Visibility} from '../../types';

import FieldLabel from './FieldLabel';
import {isDisabled} from './utils';

import modelCustomizationStyles from '../model-customization-workspace.module.scss';

const MultiInputCustomization: React.FunctionComponent<{
  label: string;
  fieldId: string;
  tooltipText: string;
  addedItems: string[];
  visibility: Visibility;
  isReadOnly: boolean;
  hideInputBoxWhenReadOnly: boolean;
  onUpdateItems: (updatedItems: string[]) => void;
  addButtonId?: string;
  validationAlert?: React.ReactNode;
}> = ({
  label,
  fieldId,
  tooltipText,
  addedItems,
  visibility,
  isReadOnly,
  hideInputBoxWhenReadOnly,
  onUpdateItems,
  addButtonId,
  validationAlert,
}) => {
  const [newItem, setNewItem] = useState('');

  const onRemove = useCallback(
    (index: number) => {
      const newItems = [...addedItems];
      newItems.splice(index, 1);
      onUpdateItems(newItems);
    },
    [addedItems, onUpdateItems]
  );

  const onAdd = useCallback(() => {
    onUpdateItems([newItem, ...addedItems]);
    setNewItem('');
    document.getElementById(fieldId)?.focus();
  }, [newItem, addedItems, fieldId, onUpdateItems]);

  return (
    <>
      {(!isReadOnly || !hideInputBoxWhenReadOnly) && (
        <>
          <div className={modelCustomizationStyles.inputContainer}>
            <FieldLabel label={label} id={fieldId} tooltipText={tooltipText} />
            <textarea
              id={fieldId}
              onChange={event => setNewItem(event.target.value)}
              value={newItem}
              disabled={isReadOnly}
            />
            {!isReadOnly && validationAlert}
          </div>
          <div className={modelCustomizationStyles.addItemContainer}>
            <MuiButton
              id={addButtonId}
              variant="outlined"
              color="tertiary"
              size="small"
              disabled={!newItem.trim() || isReadOnly}
              onClick={onAdd}
              type="button"
              startIcon={<FontAwesomeV6Icon iconName="plus" />}
            >
              {'Add'}
            </MuiButton>
          </div>
        </>
      )}
      <div className={modelCustomizationStyles.addedItemsHeaderContainer}>
        <Typography variant="strong">{'Added'}</Typography>
      </div>
      {addedItems.map((message, index) => {
        return (
          <div key={index} className={modelCustomizationStyles.itemContainer}>
            <span>{message}</span>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={modelCustomizationStyles.removeItemButton}
                disabled={isDisabled(visibility)}
              >
                <FontAwesomeV6Icon
                  iconName="circle-xmark"
                  className={modelCustomizationStyles.removeItemIcon}
                />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};

export default MultiInputCustomization;
