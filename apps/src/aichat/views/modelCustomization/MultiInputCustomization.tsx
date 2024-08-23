import React, {useState, useCallback} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';

import {Visibility} from '../../types';

import FieldLabel from './FieldLabel';
import {isDisabled} from './utils';

import styles from './retrieval-customization.module.scss';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';

const MultiInputCustomization: React.FunctionComponent<{
  label: string;
  fieldId: string;
  tooltipText: string;
  addedItems: string[];
  visibility: Visibility;
  isReadOnly: boolean;
  onUpdateItems: (updatedItems: string[]) => void;
}> = ({
  label,
  fieldId,
  tooltipText,
  addedItems,
  visibility,
  isReadOnly,
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
      {/* Do we want the inputs to disappear in both usages of this UI? And if so, we probably want to keep the header actually... */}
      {!isReadOnly && (
        <>
          <div className={modelCustomizationStyles.inputContainer}>
            <FieldLabel label={label} id={fieldId} tooltipText={tooltipText} />
            <textarea
              id={fieldId}
              onChange={event => setNewItem(event.target.value)}
              value={newItem}
            />
          </div>
          <div className={styles.addItemContainer}>
            <Button
              text="Add"
              type="secondary"
              color="gray"
              size="s"
              onClick={onAdd}
              iconLeft={{iconName: 'plus'}}
              disabled={!newItem}
            />
          </div>
        </>
      )}
      <div className={styles.addedItemsHeaderContainer}>
        <StrongText>Added</StrongText>
      </div>
      {addedItems.map((message, index) => {
        return (
          <div key={index} className={styles.itemContainer}>
            <span>{message}</span>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={styles.removeItemButton}
                disabled={isDisabled(visibility)}
              >
                <FontAwesomeV6Icon
                  iconName="circle-xmark"
                  className={styles.removeItemIcon}
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
