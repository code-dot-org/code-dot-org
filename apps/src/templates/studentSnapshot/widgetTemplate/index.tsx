import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import {Typography} from '@mui/material';
import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import i18n from '@cdo/locale';

import styles from './widgetTemplate.module.scss';

interface DropdownOption extends ActionDropdownOption {}

interface WidgetTemplateProps {
  widgetName: string;
  gridWidth: number;
  gridHeight: number;
  children: React.ReactNode;
  scrollable?: boolean;
  loading?: boolean;
  settingsOptions?: DropdownOption[];
}

const WidgetTemplate: React.FC<WidgetTemplateProps> = ({
  widgetName,
  gridWidth,
  gridHeight,
  children,
  scrollable = false,
  loading = false,
  settingsOptions = [],
}) => {
  return (
    <div
      className={styles.widget}
      style={{gridColumn: `span ${gridWidth}`, gridRow: `span ${gridHeight}`}}
    >
      <div className={styles.header}>
        <Typography component="h4" variant="h5">
          {widgetName}
        </Typography>
        {settingsOptions.length > 0 && (
          <div>
            <ActionDropdown
              triggerButtonProps={{
                color: 'gray',
                type: 'secondary',
                icon: {iconName: 'gear'},
                isIconOnly: true,
              }}
              name={`${widgetName}-settings-dropdown`}
              labelText={i18n.settings()}
              size="xs"
              disabled={loading}
              options={settingsOptions}
              menuPlacement="right"
            />
          </div>
        )}
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
