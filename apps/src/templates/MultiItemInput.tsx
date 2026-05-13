import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './multi-item-input.module.scss';

export const MultiItemInput: React.FunctionComponent<{
  items: string[];
  onAdd: () => void;
  onRemove: () => void;
  onChange: (index: number, value: string) => void;
  multiline?: boolean;
  max?: number;
  readOnly?: boolean;
}> = ({
  items,
  onAdd,
  onRemove,
  onChange,
  max,
  multiline = false,
  readOnly = false,
}) => {
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
              disabled={readOnly}
            />
          );
        })}
      </div>
      {!readOnly && (
        <div className={moduleStyles.buttonsRow}>
          {showPlus && (
            <MuiIconButton
              variant="outlined"
              color="tertiary"
              size="small"
              className={moduleStyles.plusMinusButton}
              onClick={onAdd}
              type="button"
            >
              <FontAwesomeV6Icon iconName="plus" />
            </MuiIconButton>
          )}
          <MuiIconButton
            variant="outlined"
            color="tertiary"
            size="small"
            className={moduleStyles.plusMinusButton}
            onClick={onRemove}
            type="button"
          >
            <FontAwesomeV6Icon iconName="minus" />
          </MuiIconButton>
        </div>
      )}
    </div>
  );
};

export default MultiItemInput;
