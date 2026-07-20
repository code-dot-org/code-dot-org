import {Typography} from '@mui/material';

import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {CopyButton} from './CopyButton';
import styles from './detailsBox.module.css';
import networkStyles from './networkPanel.module.css';

// One labelled box of request or response fields, with a status icon and an
// optional error banner. Ported from apps/src/weblab2/debugPanel/DetailsBox.tsx.

export interface DetailsField {
  label: string;
  value?: string | number;
  /** Adds a copy-to-clipboard button beside the label. */
  copyable?: boolean;
}

export type DetailsStatus = 'success' | 'error' | 'pending';

export interface DetailsBoxProps {
  title: string;
  status: DetailsStatus;
  /** Fields, grouped into rows; a row of more than one field lays out side by side. */
  rows: DetailsField[][];
  errorMessage?: string;
}

const STATUS_ICON = {
  success: {iconName: 'check-circle', className: networkStyles.successIcon},
  error: {iconName: 'xmark-circle', className: networkStyles.errorIcon},
  pending: {
    iconName: 'spinner',
    className: networkStyles.loadingIcon,
    animationType: 'spin' as const,
  },
} satisfies Record<
  DetailsStatus,
  {iconName: string; className: string; animationType?: 'spin'}
>;

export const DetailsBox = ({
  title,
  status,
  rows,
  errorMessage,
}: DetailsBoxProps) => {
  const icon = STATUS_ICON[status];

  return (
    <div className={styles.detailsBox}>
      <div className={styles.detailsHeader}>
        <Typography className={styles.detailsHeaderText} variant="body3">
          <Typography variant="strong">{title}</Typography>
        </Typography>
        <FontAwesomeV6Icon
          iconName={icon.iconName}
          className={icon.className}
          animationType={
            'animationType' in icon ? icon.animationType : undefined
          }
        />
      </div>
      <div className={styles.detailsBody}>
        {errorMessage && <Alert text={errorMessage} type="danger" size="xs" />}
        {rows.map(row => {
          const fields = row.map(field => (
            <div key={field.label} className={styles.detailsField}>
              <div className={styles.detailsFieldLabelRow}>
                <Typography
                  className={styles.detailsFieldLabel}
                  variant="overline3"
                >
                  {field.label}
                </Typography>
                {field.copyable && (
                  <CopyButton
                    label={field.label}
                    value={String(field.value ?? '')}
                  />
                )}
              </div>
              <pre className={styles.detailsFieldValueContainer}>
                <Typography
                  className={styles.detailsFieldValue}
                  variant="body3"
                >
                  {field.value}
                </Typography>
              </pre>
            </div>
          ));

          // Keyed by the labels it holds: rows are a fixed layout grouping, so
          // the labels are stable and unique within a box.
          return row.length > 1 ? (
            <div
              key={row.map(field => field.label).join('|')}
              className={styles.detailsRow}
            >
              {fields}
            </div>
          ) : (
            fields
          );
        })}
      </div>
    </div>
  );
};
