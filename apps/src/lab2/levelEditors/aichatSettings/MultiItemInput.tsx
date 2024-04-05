import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';
import moduleStyles from './edit-aichat-settings.module.scss';

export const MultiItemInput: React.FunctionComponent<{
  items: string[];
  onAdd: () => void;
  onRemove: () => void;
  onChange: (index: number, value: string) => void;
  multiline?: boolean;
  max?: number;
}> = ({items, onAdd, onRemove, onChange, max, multiline = false}) => {
  const Tag = multiline ? 'textarea' : 'input';
  const showPlus = max === undefined || items.length < max;
  return (
    <div className={moduleStyles.multiItemContainer}>
      <div
        className={classNames(
          moduleStyles.multiItemInput,
          multiline && moduleStyles.multiItemInputMultiline
        )}
      >
        {items.map((item, index) => {
          return (
            <Tag
              key={index}
              type="text"
              value={item}
              className={classNames(
                multiline ? moduleStyles.textarea : moduleStyles.inlineLabel
              )}
              onChange={e => onChange(index, e.target.value)}
            />
          );
        })}
      </div>
      <div className={moduleStyles.buttonsRow}>
        {showPlus && (
          <button
            type="button"
            className={moduleStyles.plusMinusButton}
            onClick={onAdd}
          >
            <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
          </button>
        )}
        <button
          type="button"
          className={moduleStyles.plusMinusButton}
          onClick={onRemove}
        >
          <FontAwesomeV6Icon iconName="minus" iconStyle="solid" />
        </button>
      </div>
    </div>
  );
};

export default MultiItemInput;
