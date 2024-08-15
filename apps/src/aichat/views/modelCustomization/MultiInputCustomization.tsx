import React, {useState, useCallback} from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';

import {Visibility} from '../../types';

import FieldLabel from './FieldLabel';
import UpdateButton from './UpdateButton';
import {isDisabled} from './utils';

import styles from './retrieval-customization.module.scss';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';

const MultiInputCustomization: React.FunctionComponent<{
  label: string;
  fieldId: string;
  tooltipText: string;
  addedItems: string[];
  visibility: Visibility;
  onUpdateItems: (items: string[]) => void;
}> = ({label, fieldId, tooltipText, addedItems, visibility, onUpdateItems}) => {
  const [newItem, setNewItem] = useState('');

  const isReadOnly = useSelector(isReadOnlyWorkspace) || isDisabled(visibility);

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
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div className={modelCustomizationStyles.customizationContainer}>
        {!isReadOnly && (
          <>
            <div className={modelCustomizationStyles.inputContainer}>
              <FieldLabel
                label={label}
                id={fieldId}
                tooltipText={tooltipText}
              />
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
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <UpdateButton isDisabledDefault={isReadOnly} />
      </div>
    </div>
  );
};

export default MultiInputCustomization;
