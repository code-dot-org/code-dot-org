import React, {useCallback} from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setModelCardProperty} from '../../redux/aichatRedux';
import {Visibility} from '../../types';

import MultiInputCustomization from './MultiInputCustomization';

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

  return (
    <MultiInputCustomization
      label={fieldLabel}
      fieldId={fieldId}
      tooltipText={tooltipText}
      addedItems={topics}
      visibility={visibility}
      isReadOnly={readOnly}
      onUpdateItems={onUpdateItems}
    />
  );
};

export default ExampleTopicsInputs;
