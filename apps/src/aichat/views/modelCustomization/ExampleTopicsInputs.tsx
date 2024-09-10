import React, {useCallback, useMemo} from 'react';

import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setModelCardProperty} from '../../redux/aichatRedux';
import {Visibility} from '../../types';

import MultiInputCustomization from './MultiInputCustomization';

import modelCustomizationStyles from '../model-customization-workspace.module.scss';

const ExampleTopicsInputs: React.FunctionComponent<{
  fieldLabel: string;
  fieldId: string;
  tooltipText: string;
  topics: string[];
  readOnly: boolean;
  visibility: Visibility;
}> = ({fieldLabel, fieldId, tooltipText, topics, readOnly, visibility}) => {
  const dispatch = useAppDispatch();

  const onUpdateItems = useCallback(
    (updatedItems: string[]) => {
      dispatch(
        setModelCardProperty({
          property: 'exampleTopics',
          value: updatedItems,
        })
      );
    },
    [dispatch]
  );

  const validationAlert = useMemo(() => {
    return (
      <Alert
        text="Must add at least one example prompt"
        type={alertTypes.warning}
        size="s"
        className={modelCustomizationStyles.examplePromptAlert}
      />
    );
  }, []);

  return (
    <MultiInputCustomization
      label={fieldLabel}
      fieldId={fieldId}
      tooltipText={tooltipText}
      addedItems={topics}
      visibility={visibility}
      isReadOnly={readOnly}
      hideInputBoxWhenReadOnly={false}
      onUpdateItems={onUpdateItems}
      addButtonId="uitest-add-example-topic"
      validationAlert={topics?.length === 0 ? validationAlert : undefined}
    />
  );
};

export default ExampleTopicsInputs;
