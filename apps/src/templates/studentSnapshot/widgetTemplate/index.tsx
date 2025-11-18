import {Button} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './widgetTemplate.module.scss';

interface WidgetTemplateProps {
  widgetName: string;
  gridWidth: number;
  gridHeight: number;
  children: React.ReactNode;
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({
  widgetName,
  gridWidth,
  gridHeight,
  children,
}) => {
  return (
    <div
      className={styles.widget}
      style={{gridColumn: `span ${gridWidth}`, gridRow: `span ${gridHeight}`}}
    >
      <div className={styles.header}>
        <Typography variant="body2">{widgetName}</Typography>
        <div>
          <Button
            color="gray"
            size="xs"
            type="secondary"
            onClick={() => alert('Settings - does nothing yet')}
            isIconOnly
            icon={{iconName: 'gear'}}
          />
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default WidgetTemplate;
