import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import Tooltip from '@cdo/apps/templates/Tooltip';

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
  duplicateValidation: (validation: Validation) => void;
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
  duplicateValidation,
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
      <div className={moduleStyles.section}>
        <div
          className={classNames(moduleStyles.column, moduleStyles.columnFirst)}
        >
          {'Info'}
        </div>
        <div className={moduleStyles.column}>
          <input
            type="text"
            id="edit-validation-comment"
            name="comment"
            className={moduleStyles.comment}
            placeholder="Optional comment..."
            value={validation.comment}
            onChange={e => {
              validation.comment = e.target.value;
              onValidationChange(validation);
            }}
          />
        </div>
        <div className={moduleStyles.column}>
          <div className={moduleStyles.buttonsRow}>
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
              <FontAwesome
                icon="arrow-down"
                title={undefined}
                className="icon"
              />
            </button>
            <button
              type="button"
              onClick={() => duplicateValidation(validation)}
              className={moduleStyles.duplicateValidationButton}
            >
              <FontAwesome icon="copy" title={undefined} className="icon" />
            </button>
            <button
              type="button"
              onClick={() => deleteValidation(validation.key)}
              className={moduleStyles.deleteValidationButton}
            >
              <FontAwesome icon="trash" title={undefined} className="icon" />
            </button>
          </div>
        </div>
      </div>
      <div className={moduleStyles.section}>
        <div
          className={classNames(moduleStyles.column, moduleStyles.columnFirst)}
        >
          {'When'}
        </div>
        <div className={moduleStyles.column}>
          {validation.conditions.map((condition, index) => {
            return (
              <div className={moduleStyles.row} key={`${index}-condition`}>
                <EditCondition
                  condition={condition}
                  conditionTypes={conditionTypes}
                  index={index}
                  onConditionChange={onConditionChange}
                  deleteCondition={deleteCondition}
                />
                <div
                  className={moduleStyles.row}
                  key={`${index}-description`}
                />
                {index === validation.conditions.length - 1 && (
                  <button
                    type="button"
                    onClick={addCondition}
                    className={moduleStyles.addConditionButton}
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
          {validation.conditions.length === 0 && (
            <button
              type="button"
              onClick={addCondition}
              className={moduleStyles.addConditionButton}
            >
              Add new condition
            </button>
          )}
        </div>
      </div>

      <div className={moduleStyles.section}>
        <div
          className={classNames(moduleStyles.column, moduleStyles.columnFirst)}
        >
          {'Then'}
        </div>
        <div className={moduleStyles.column}>
          <div className={moduleStyles.row}>
            <div className={moduleStyles.column}>
              <textarea
                id="message"
                name="message"
                rows={4}
                className={moduleStyles.message}
                placeholder="Feedback message..."
                value={validation.message}
                onChange={e => {
                  validation.message = e.target.value;
                  onValidationChange(validation);
                }}
              />
            </div>
            <div className={moduleStyles.column}>
              <div className={moduleStyles.row}>
                <Tooltip
                  text={<SafeMarkdown markdown={validation.message || ''} />}
                  place="right"
                >
                  <FontAwesomeV6Icon iconName="eye" iconStyle="regular" />
                </Tooltip>
              </div>
              <div className={moduleStyles.row}>
                <label htmlFor="callout" className={moduleStyles.label}>
                  Callout:
                </label>
                <input
                  type="text"
                  id="edit-validation-callout"
                  name="callout"
                  className={moduleStyles.callout}
                  value={validation.callout}
                  onChange={e => {
                    validation.callout = e.target.value;
                    onValidationChange(validation);
                  }}
                />
              </div>
              <div className={moduleStyles.row}>
                <label htmlFor="next" className={moduleStyles.label}>
                  Passes level:
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditValidation;
