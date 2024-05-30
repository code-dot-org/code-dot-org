import React, {useState, useCallback} from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import styles from './retrieval-customization.module.scss';
import {isDisabled} from './utils';
import {setAiCustomizationProperty} from '@cdo/apps/aichat/redux/aichatRedux';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useSelector} from 'react-redux';
import UpdateButton from './UpdateButton';

const RetrievalCustomization: React.FunctionComponent = () => {
  const [newRetrievalContext, setNewRetrievalContext] = useState('');

  const dispatch = useAppDispatch();
  const visibility = useAppSelector(
    state => state.aichat.fieldVisibilities.retrievalContexts
  );
  const {retrievalContexts} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const isReadOnly = useSelector(isReadOnlyWorkspace) || isDisabled(visibility);

  const onAdd = useCallback(() => {
    dispatch(
      setAiCustomizationProperty({
        property: 'retrievalContexts',
        value: [newRetrievalContext, ...retrievalContexts],
      })
    );
    setNewRetrievalContext('');
    document.getElementById('retrieval-input')?.focus();
  }, [
    dispatch,
    retrievalContexts,
    newRetrievalContext,
    setNewRetrievalContext,
  ]);

  const onRemove = useCallback(
    (index: number) => {
      const newRetrievalContexts = [...retrievalContexts];
      newRetrievalContexts.splice(index, 1);
      dispatch(
        setAiCustomizationProperty({
          property: 'retrievalContexts',
          value: newRetrievalContexts,
        })
      );
    },
    [dispatch, retrievalContexts]
  );

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div className={modelCustomizationStyles.customizationContainer}>
        <div className={modelCustomizationStyles.inputContainer}>
          <label htmlFor="system-prompt">
            <StrongText>Retrieval</StrongText>
          </label>
          <textarea
            id="retrieval-input"
            onChange={event => setNewRetrievalContext(event.target.value)}
            value={newRetrievalContext}
            disabled={isReadOnly}
          />
        </div>
        <div className={styles.addItemContainer}>
          <Button
            text="Add"
            type="secondary"
            onClick={onAdd}
            iconLeft={{iconName: 'plus'}}
            disabled={!newRetrievalContext || isReadOnly}
          />
        </div>
        <div className={styles.addedItemsHeaderContainer}>
          <StrongText>Added</StrongText>
        </div>
        {retrievalContexts.map((message, index) => {
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

export default RetrievalCustomization;
