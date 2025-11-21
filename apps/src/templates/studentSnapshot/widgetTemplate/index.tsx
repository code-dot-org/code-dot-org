import {Button} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './widgetTemplate.module.scss';

interface WidgetTemplateProps {
  widgetName: string;
  gridWidth: number;
  gridHeight: number;
  children: React.ReactNode;
  scrollable?: boolean;
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({
  widgetName,
  gridWidth,
  gridHeight,
  children,
  scrollable = false,
}) => {
  return (
    <div
      className={styles.widget}
      style={{gridColumn: `span ${gridWidth}`, gridRow: `span ${gridHeight}`}}
    >
      <div className={styles.header}>
        <Typography variant="h5">{widgetName}</Typography>
        <div>
          <Button
            color="gray"
            size="xs"
            type="secondary"
            onClick={() => alert('Settings - does nothing yet')}
            isIconOnly
            icon={{iconName: 'gear'}}
            aria-label={i18n.settings()}
          />
        </div>
      </div>
      <div
        className={`${styles.content} ${
          scrollable ? styles.scrollable : styles.hidden
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default WidgetTemplate;
