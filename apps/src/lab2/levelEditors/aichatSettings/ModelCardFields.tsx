import React, {useContext} from 'react';
import MultiItemInput from './MultiItemInput';
import moduleStyles from './edit-aichat-settings.module.scss';
import {
  MAX_ASK_ABOUT_TOPICS,
  MODEL_CARD_FIELDS_AND_LABELS,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {UpdateContext} from './UpdateContext';

const ModelCardFields: React.FunctionComponent = () => {
  const {setModelCardPropertyValue, aichatSettings: aiCustomizations} =
    useContext(UpdateContext);
  const modelCardInfo = aiCustomizations.initialCustomizations.modelCardInfo;
  const exampleTopics = modelCardInfo.exampleTopics;
  return (
    <div className={moduleStyles['model-card-fields']}>
      {MODEL_CARD_FIELDS_AND_LABELS.map(([property, label]) => {
        return (
          <div key={property}>
            <label htmlFor={`modelCard-${property}`}>{label}</label>
            <textarea
              id={`modelCard-${property}`}
              value={modelCardInfo[property]}
              onChange={e =>
                setModelCardPropertyValue(property, e.target.value)
              }
              className={moduleStyles.textarea}
            />
          </div>
        );
      })}
      <label>Example Prompts and Topics</label>
      <MultiItemInput
        items={exampleTopics || []}
        onAdd={() => {
          setModelCardPropertyValue(
            'exampleTopics',
            exampleTopics?.concat('') || ['']
          );
        }}
        onRemove={() => {
          setModelCardPropertyValue(
            'exampleTopics',
            exampleTopics?.slice(0, -1) || []
          );
        }}
        onChange={(index, value) => {
          const updatedTopics = exampleTopics?.slice() || [];
          updatedTopics[index] = value;
          setModelCardPropertyValue('exampleTopics', updatedTopics);
        }}
        max={MAX_ASK_ABOUT_TOPICS}
      />
    </div>
  );
};

export default ModelCardFields;
