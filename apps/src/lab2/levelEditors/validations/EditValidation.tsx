import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

import {ConditionType, Validation, Condition} from '../../types';

import EditCondition from './EditCondition';

import moduleStyles from './edit-validations.module.scss';

interface EditValidationProps {
  validation: Validation;
  index: number;
  onValidationChange: (validation: Validation) => void;
  deleteValidation: (key: string) => void;
  conditionTypes: ConditionType[];
  moveValidation: (key: string, direction: 'up' | 'down') => void;
}

/**
 * Editor for a single validation set.
 */
const EditValidation: React.FunctionComponent<EditValidationProps> = ({
  validation,
  index,
  onValidationChange,
  deleteValidation,
  conditionTypes,
  moveValidation,
}) => {
  const onConditionChange = (condition: Condition, index: number) => {
    validation.conditions[index] = condition;
    onValidationChange(validation);
  };

  const addCondition = () => {
    const defaultCondition = conditionTypes[0];
    validation.conditions.push({name: defaultCondition.name});
    onValidationChange(validation);
  };

  const deleteCondition = (index: number) => {
    validation.conditions.splice(index, 1);
    onValidationChange(validation);
  };

  return (
    <div className={moduleStyles.validation}>
      <div className={moduleStyles.row}>
        <Typography
          semanticTag="h3"
          visualAppearance="heading-xs"
          className={moduleStyles.validationTitle}
        >
          {'Validation Set ' + (index + 1)}
        </Typography>
        <button
          type="button"
          onClick={() => moveValidation(validation.key, 'up')}
          className={moduleStyles.moveValidationButton}
        >
          <FontAwesome icon="arrow-up" title={undefined} className="icon" />
        </button>

        <button
          type="button"
          onClick={() => moveValidation(validation.key, 'down')}
          className={moduleStyles.moveValidationButton}
        >
          <FontAwesome icon="arrow-down" title={undefined} className="icon" />
        </button>
        <button
          type="button"
          onClick={() => deleteValidation(validation.key)}
          className={moduleStyles.deleteValidationButton}
        >
          <FontAwesome icon="trash" title={undefined} className="icon" />
        </button>
      </div>
      <div className={moduleStyles.row}>
        <label htmlFor="message" className={moduleStyles.label}>
          Message:
        </label>
        <textarea
          id="message"
          name="message"
          rows={1}
          className={moduleStyles.message}
          value={validation.message}
          onChange={e => {
            validation.message = e.target.value;
            onValidationChange(validation);
          }}
        />
      </div>
      <div className={moduleStyles.row}>
        <label htmlFor="next" className={moduleStyles.label}>
          Passes Level?
        </label>
        <input
          type="checkbox"
          id="next"
          name="next"
          checked={validation.next}
          onChange={e => {
            validation.next = e.target.checked;
            onValidationChange(validation);
          }}
        />
      </div>
      <Typography
        semanticTag="h4"
        visualAppearance="body-two"
        className={moduleStyles.validationTitle}
      >
        {'Conditions'}
      </Typography>
      {validation.conditions.map((condition, index) => {
        return (
          <div className={moduleStyles.row} key={index}>
            <EditCondition
              condition={condition}
              conditionTypes={conditionTypes}
              index={index}
              onConditionChange={onConditionChange}
              deleteCondition={deleteCondition}
            />
          </div>
        );
      })}
      <div className={moduleStyles.row}>
        <button
          type="button"
          onClick={addCondition}
          className={moduleStyles.addConditionButton}
        >
          + Add New Condition
        </button>
      </div>
    </div>
  );
};

export default EditValidation;
