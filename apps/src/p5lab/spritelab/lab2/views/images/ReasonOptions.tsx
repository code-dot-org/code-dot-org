// A list of reasons to pick any of: the design system's checkboxes, each
// laid out as a full-width row that tints when picked.

import Checkbox from '@code-dot-org/component-library/checkbox';
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
        <Checkbox
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          size="m"
          checked={picked}
          className={classNames(
            styles.reasonRow,
            picked && styles.reasonRowPicked
          )}
          onChange={e =>
            onChange(
              e.target.checked
                ? [...values, option.value]
                : values.filter(v => v !== option.value)
            )
          }
        />
      );
    })}
  </div>
);

export default ReasonOptions;
