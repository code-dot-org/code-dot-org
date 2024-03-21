import React, {useState, useCallback} from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import styles from './retrieval-customization.module.scss';
import {isDisabled} from './utils';
import {setAiCustomizationProperty} from '@cdo/apps/aichat/redux/aichatRedux';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';

const RetrievalCustomization: React.FunctionComponent = () => {
  const [newRetrievalContext, setNewRetrievalContext] = useState('');

  const dispatch = useAppDispatch();

  const {visibility} = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  ).retrievalContexts;
  const {retrievalContexts} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const onUpdate = () =>
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save({source: JSON.stringify(aiCustomizations)}, true);

  const onAdd = useCallback(() => {
    dispatch(
      setAiCustomizationProperty({
        property: 'retrievalContexts',
        value: [...retrievalContexts, newRetrievalContext],
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
      <div>
        <div className={modelCustomizationStyles.inputContainer}>
          <label htmlFor="system-prompt">
            <StrongText>Retrieval</StrongText>
          </label>
          <textarea
            id="retrieval-input"
            onChange={event => setNewRetrievalContext(event.target.value)}
            value={newRetrievalContext}
            disabled={isDisabled(visibility)}
          />
        </div>
        <div className={styles.addItemContainer}>
          <button
            type="button"
            onClick={onAdd}
            disabled={!newRetrievalContext || isDisabled(visibility)}
          >
            Add
          </button>
        </div>
        {retrievalContexts.map((message, index) => {
          return (
            <div key={index} className={styles.itemContainer}>
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
              <span className={styles.itemText}>{message}</span>
            </div>
          );
        })}
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <button
          type="button"
          disabled={isDisabled(visibility)}
          onClick={onUpdate}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default RetrievalCustomization;
