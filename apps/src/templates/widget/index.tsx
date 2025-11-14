import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React from 'react';

import styles from './widget.module.scss';

interface WidgetProps {
  title: string;
  onRefresh?: () => void;
  onSettings?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Widget = ({
  title,
  onRefresh,
  onSettings,
  children,
  className,
}: WidgetProps) => {
  return (
    <div className={classNames(styles.widgetContainer, className)}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>{title}</h3>
        <div className={styles.widgetActions}>
          <Button
            aria-label="Refresh"
            isIconOnly
            icon={{iconName: 'rotate-right'}}
            onClick={onRefresh}
            size="xs"
            type="tertiary"
            color="black"
          />
          <Button
            aria-label="Settings"
            isIconOnly
            icon={{iconName: 'gear'}}
            onClick={onSettings}
            size="xs"
            type="tertiary"
            color="black"
          />
        </div>
      </div>
      <div className={styles.widgetContent}>{children}</div>
    </div>
  );
};

export default Widget;
