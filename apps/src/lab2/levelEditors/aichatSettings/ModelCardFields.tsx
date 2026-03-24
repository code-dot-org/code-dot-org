import React, {useContext} from 'react';

import {
  MAX_ASK_ABOUT_TOPICS,
  getModelCardFieldsLabelsIcons,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import MultiItemInput from '@cdo/apps/templates/MultiItemInput';

import {UpdateContext} from './UpdateContext';

import moduleStyles from './edit-aichat-settings.module.scss';

const ModelCardFields: React.FunctionComponent = () => {
  const {setModelCardPropertyValue, aichatSettings} = useContext(UpdateContext);
  const modelCardInfo = aichatSettings.initialCustomizations.modelCardInfo;
  const exampleTopics = modelCardInfo.exampleTopics;
  return (
    <div className={moduleStyles['model-card-fields']}>
      {getModelCardFieldsLabelsIcons().map(({property, label}) => {
        if (property === 'exampleTopics' || property === 'isPublished') {
          return null;
        }
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
      <p className={moduleStyles.marginBottom}>Example Prompts and Topics</p>
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
