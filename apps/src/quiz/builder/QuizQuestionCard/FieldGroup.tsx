import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './quiz-question-card.module.scss';

interface FieldGroupProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

const FieldGroup: React.FunctionComponent<FieldGroupProps> = ({
  label,
  className,
  children,
}) => (
  <fieldset className={classNames(styles.fieldGroup, className)}>
    <legend className={styles.fieldGroupLabel}>
      <Typography variant="label3" component="span">
        {label}
      </Typography>
    </legend>
    {children}
  </fieldset>
);

export default FieldGroup;
