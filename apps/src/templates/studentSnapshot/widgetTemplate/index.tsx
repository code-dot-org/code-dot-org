import {Button} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import i18n from '@cdo/locale';

import styles from './widgetTemplate.module.scss';

interface WidgetTemplateProps {
  widgetName: string;
  gridWidth: number;
  gridHeight: number;
  children: React.ReactNode;
  scrollable?: boolean;
  loading?: boolean;
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({
  widgetName,
  gridWidth,
  gridHeight,
  children,
  scrollable = false,
  loading = false,
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
            aria-label={i18n.settings()}
            disabled={loading}
          />
        </div>
      </div>
      <div
        className={`${styles.content} ${
          scrollable ? styles.scrollable : styles.hidden
        }`}
      >
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="large" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default WidgetTemplate;
