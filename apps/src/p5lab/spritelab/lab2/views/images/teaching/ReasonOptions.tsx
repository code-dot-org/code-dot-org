// A list of reasons to pick any of: the design system's checkboxes, each
// laid out as a full-width row that tints when picked.

import Checkbox from '@code-dot-org/component-library/checkbox';
import classNames from 'classnames';
import React from 'react';

import styles from '../images-tab.module.scss';

export interface ReasonOption {
  value: string;
  label: string;
}

interface ReasonOptionsProps {
  name: string;
  /** The question the reasons answer, read to screen readers as the group's
      name. */
  legend: string;
  options: ReasonOption[];
  values: string[];
  onChange: (values: string[]) => void;
}

const ReasonOptions: React.FunctionComponent<ReasonOptionsProps> = ({
  name,
  legend,
  options,
  values,
  onChange,
}) => (
  <fieldset className={styles.reasonList}>
    <legend className={styles.srOnly}>{legend}</legend>
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
  </fieldset>
);

export default ReasonOptions;
