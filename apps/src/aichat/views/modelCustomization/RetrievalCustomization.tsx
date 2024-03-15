import React, {useState, useCallback} from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import styles from './retrieval-customization.module.scss';
import {isDisabled} from './utils';
import {setLevelAiCustomizationProperty} from '@cdo/apps/aichat/redux/aichatRedux';

const RetrievalCustomization: React.FunctionComponent = () => {
  const [newRetrievalContext, setNewRetrievalContext] = useState('');

  const dispatch = useAppDispatch();

  const {retrievalContexts} = useAppSelector(
    state => state.aichat.levelAiCustomizations
  );

  const onAdd = useCallback(() => {
    dispatch(
      setLevelAiCustomizationProperty({
        property: 'retrievalContexts',
        value: [...retrievalContexts.value, newRetrievalContext],
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
      const newRetrievalContexts = [...retrievalContexts.value];
      newRetrievalContexts.splice(index, 1);
      dispatch(
        setLevelAiCustomizationProperty({
          property: 'retrievalContexts',
          value: newRetrievalContexts,
        })
      );
    },
    [dispatch, retrievalContexts]
  );

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div>
        <div className={modelCustomizationStyles.inputContainer}>
          <label htmlFor="system-prompt">
            <StrongText>Retrieval</StrongText>
          </label>
          <textarea
            id="retrieval-input"
            onChange={event => setNewRetrievalContext(event.target.value)}
            value={newRetrievalContext}
            disabled={isDisabled(retrievalContexts.visibility)}
            readOnly
          />
        </div>
        <div className={styles.addItemContainer}>
          <button
            type="button"
            onClick={onAdd}
            disabled={
              !newRetrievalContext || isDisabled(retrievalContexts.visibility)
            }
          >
            Add
          </button>
        </div>
        {retrievalContexts.value.map((message, index) => {
          return (
            <div key={index} className={styles.itemContainer}>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={styles.removeItemButton}
                disabled={isDisabled(retrievalContexts.visibility)}
              >
                <FontAwesomeV6Icon
                  iconName="circle-xmark"
                  className={styles.removeItemIcon}
                />
              </button>
              <span className={styles.itemText}>{message}</span>
            </div>
          );
        })}
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <button
          type="button"
          disabled={isDisabled(retrievalContexts.visibility)}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default RetrievalCustomization;
