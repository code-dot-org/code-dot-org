import {ModelCardInfo} from '@cdo/apps/aichat/types';
import React, {useContext} from 'react';
import MultiItemInput from './MultiItemInput';
import moduleStyles from './edit-ai-customizations.module.scss';
import {MAX_ASK_ABOUT_TOPICS} from '@cdo/apps/aichat/constants';
import {UpdateContext} from './UpdateContext';

const modelCardFieldsAndLabels: [keyof ModelCardInfo, string][] = [
  ['description', 'Description'],
  ['intendedUse', 'Intended Use'],
  ['limitationsAndWarnings', 'Limitations and Warnings'],
  ['testingAndEvaluation', 'Testing and Evaluation'],
];

const ModelCardFields: React.FunctionComponent = () => {
  const {setModelCardPropertyValue, aiCustomizations} =
    useContext(UpdateContext);
  const exampleTopics = aiCustomizations.modelCardInfo?.value?.exampleTopics;
  return (
    <div className={moduleStyles['model-card-fields']}>
      {modelCardFieldsAndLabels.map(([property, label]) => {
        return (
          <div key={property}>
            <label htmlFor={`modelCard-${property}`}>{label}</label>
            <textarea
              id={`modelCard-${property}`}
              value={aiCustomizations.modelCardInfo?.value?.[property] || ''}
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
