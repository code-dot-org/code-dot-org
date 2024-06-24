import React from 'react';

import MultiItemInput from '@cdo/apps/templates/MultiItemInput';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setModelCardProperty} from '../../redux/aichatRedux';

const ExampleTopicsInputs: React.FunctionComponent<{
  topics: string[];
  readOnly: boolean;
}> = ({topics, readOnly}) => {
  const dispatch = useAppDispatch();

  return (
    <MultiItemInput
      items={topics}
      onAdd={() =>
        dispatch(
          setModelCardProperty({
            property: 'exampleTopics',
            value: [...topics].concat(''),
          })
        )
      }
      onRemove={() => {
        dispatch(
          setModelCardProperty({
            property: 'exampleTopics',
            value: [...topics].slice(0, -1),
          })
        );
      }}
      onChange={(index, value) => {
        const updatedTopics = topics.slice();
        updatedTopics[index] = value;
        dispatch(
          setModelCardProperty({
            property: 'exampleTopics',
            value: updatedTopics,
          })
        );
      }}
      readOnly={readOnly}
    />
  );
};

export default ExampleTopicsInputs;
