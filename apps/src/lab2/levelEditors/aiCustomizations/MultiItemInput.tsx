import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';
import moduleStyles from './edit-ai-customizations.module.scss';

export const MultiItemInput: React.FunctionComponent<{
  items: string[];
  onAdd: () => void;
  onRemove: () => void;
  onChange: (index: number, value: string) => void;
  multiline?: boolean;
}> = ({items, onAdd, onRemove, onChange, multiline = false}) => {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className={moduleStyles.multiItemInput}>
      {items.map((item, index) => {
        return (
          <Tag
            key={index}
            type="text"
            value={item}
            className={classNames(multiline && moduleStyles.textarea)}
            onChange={e => onChange(index, e.target.value)}
          />
        );
      })}
      <div className={moduleStyles.buttonsRow}>
        <button
          type="button"
          className={moduleStyles.plusMinusButton}
          onClick={onAdd}
        >
          <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
        </button>
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
