import {ModelCardInfo} from '@cdo/apps/aichat/types';
import React, {useContext} from 'react';
import {UpdateContext} from './EditAiCustomizations';
import MultiItemInput from './MultiItemInput';
import moduleStyles from './edit-ai-customizations.module.scss';

const modelCardFieldsAndLabels: [keyof ModelCardInfo, string][] = [
  ['description', 'Description'],
  ['intendedUse', 'Intended Use'],
  ['limitationsAndWarnings', 'Limitations and Warnings'],
  ['testingAndEvaluation', 'Testing and Evaluation'],
];

const ModelCardFields: React.FunctionComponent = () => {
  const {setModelCardPropertyValue, aiCustomizations} =
    useContext(UpdateContext);
  const askAboutTopics = aiCustomizations.modelCardInfo?.value?.askAboutTopics;
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
      <label>Ask About Topics</label>
      <MultiItemInput
        items={askAboutTopics || []}
        onAdd={() => {
          setModelCardPropertyValue(
            'askAboutTopics',
            askAboutTopics?.concat('') || ['']
          );
        }}
        onRemove={() => {
          setModelCardPropertyValue(
            'askAboutTopics',
            askAboutTopics?.slice(0, -1) || []
          );
        }}
        onChange={(index, value) => {
          const updatedTopics = askAboutTopics?.slice() || [];
          updatedTopics[index] = value;
          setModelCardPropertyValue('askAboutTopics', updatedTopics);
        }}
      />
    </div>
  );
};

export default ModelCardFields;
