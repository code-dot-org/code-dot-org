import React, {useState, useCallback} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';

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
}> = ({
  label,
  fieldId,
  tooltipText,
  addedItems,
  visibility,
  isReadOnly,
  hideInputBoxWhenReadOnly: hideInputBoxWhenReadOnly,
  onUpdateItems,
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
          </div>
          <div className={modelCustomizationStyles.addItemContainer}>
            <Button
              text="Add"
              type="secondary"
              color="gray"
              size="s"
              onClick={onAdd}
              iconLeft={{iconName: 'plus'}}
              disabled={!newItem || isReadOnly}
            />
          </div>
        </>
      )}
      <div className={modelCustomizationStyles.addedItemsHeaderContainer}>
        <StrongText>Added</StrongText>
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
