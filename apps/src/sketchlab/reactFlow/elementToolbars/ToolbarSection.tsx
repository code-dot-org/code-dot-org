import {Typography} from '@mui/material';
import React from 'react';

import styles from './element-toolbar.module.scss';

interface ToolbarSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function ToolbarSection({title, children}: ToolbarSectionProps) {
  return (
    <section className={styles.section} role="group" aria-label={title}>
      <Typography
        variant="overline3"
        className={styles.sectionTitle}
        aria-hidden="true"
      >
        {title}
      </Typography>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
