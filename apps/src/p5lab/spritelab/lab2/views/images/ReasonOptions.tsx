// A list of reasons to pick any of: full-width rows, the picked ones
// marked with a check. Checkboxes underneath, styled as rows.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import styles from './images-tab.module.scss';

interface ReasonOptionsProps {
  name: string;
  options: {value: string; label: string}[];
  values: string[];
  onChange: (values: string[]) => void;
}

const ReasonOptions: React.FunctionComponent<ReasonOptionsProps> = ({
  name,
  options,
  values,
  onChange,
}) => (
  <div className={styles.reasonList}>
    {options.map(option => {
      const picked = values.includes(option.value);
      return (
        <label
          key={option.value}
          className={classNames(
            styles.reasonRow,
            picked && styles.reasonRowPicked
          )}
        >
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={picked}
            className={styles.reasonInput}
            onChange={e =>
              onChange(
                e.target.checked
                  ? [...values, option.value]
                  : values.filter(v => v !== option.value)
              )
            }
          />
          <span className={styles.reasonCheck} aria-hidden>
            {picked && <FontAwesomeV6Icon iconName="check" iconStyle="solid" />}
          </span>
          {option.label}
        </label>
      );
    })}
  </div>
);

export default ReasonOptions;
