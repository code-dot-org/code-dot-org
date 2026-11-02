import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useId} from 'react';

import styles from './quiz-question-card.module.scss';

interface FieldGroupProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

// A fieldset legend hangs on the border and throws off label/field spacing.
const FieldGroup: React.FunctionComponent<FieldGroupProps> = ({
  label,
  className,
  children,
}) => {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={classNames(styles.field, className)}
    >
      <Typography id={labelId} variant="label3" component="span">
        {label}
      </Typography>
      {children}
    </div>
  );
};

export default FieldGroup;
