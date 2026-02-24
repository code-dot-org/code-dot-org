import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../../locale';
import {setAiCustomizationProperty} from '../../redux';

import MultiInputCustomization from './MultiInputCustomization';
import SaveChangesAlerts from './SaveChangesAlerts';
import UpdateButton from './UpdateButton';
import {isDisabled} from './utils';

import modelCustomizationStyles from '../model-customization-workspace.module.scss';

const RetrievalCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const visibility = useAppSelector(
    state => state.aichat.fieldVisibilities.retrievalContexts
  );
  const {retrievalContexts} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const isReadOnly = useSelector(isReadOnlyWorkspace) || isDisabled(visibility);

  const onUpdateItems = useCallback(
    (updatedItems: string[]) => {
      dispatch(
        setAiCustomizationProperty({
          property: 'retrievalContexts',
          value: updatedItems,
        })
      );
    },
    [dispatch]
  );

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div className={modelCustomizationStyles.customizationContainer}>
        <MultiInputCustomization
          label={aichatI18n.retrievalCustomizationHeader()}
          fieldId="retrieval-input"
          tooltipText={aichatI18n.retrievalCustomizationTooltipText()}
          addedItems={retrievalContexts}
          visibility={visibility}
          isReadOnly={isReadOnly}
          hideInputBoxWhenReadOnly={true}
          onUpdateItems={onUpdateItems}
        />
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <UpdateButton isDisabledDefault={isReadOnly} />
      </div>
      <SaveChangesAlerts isReadOnly={isReadOnly} />
    </div>
  );
};

export default RetrievalCustomization;
