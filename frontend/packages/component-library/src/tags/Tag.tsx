import Chip from '@mui/material/Chip';
import classNames from 'classnames';
import type {Key, KeyboardEvent, MouseEvent, ReactNode} from 'react';
import {memo, useMemo} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import {WithTooltip} from '@/tooltip';

import {
  TagColor,
  TagSize,
  TagVariant,
  transformTagPropsCore,
} from './tagPropsToMuiCore';

import moduleStyles from './tags.module.scss';

type TagIconProps = FontAwesomeV6IconProps & {
  placement: 'left' | 'right';
};

export interface TagProps {
  /** Optional key for lists */
  key?: Key;
  /** Tag label */
  label: ReactNode;
  /** Tag size */
  size?: TagSize;
  /** Tag variant (aliases: filled -> solid, outlined -> light) */
  variant?: TagVariant;
  /** Tag color */
  color?: TagColor;
  /** Optional icon to show next to the label */
  icon?: TagIconProps;
  /** Optional tooltip content */
  tooltipContent?: string | ReactNode;
  /** Optional tooltip id (required when tooltipContent is provided) */
  tooltipId?: string;
  /** aria-label for the tag */
  ariaLabel?: string;
  /** Optional className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Callback to remove the tag */
  onDelete?: (event?: MouseEvent<HTMLButtonElement>) => void;
  /** @deprecated Use onDelete instead */
  onClose?: (
    event?: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => void;
  /** @deprecated Use onDelete instead */
  type?: 'default' | 'closable';
  /** Optional id */
  id?: string;
  /** aria-label override */
  'aria-label'?: string;
}

const Tag = (props: TagProps) => {
  const {
    label,
    icon,
    tooltipContent,
    tooltipId,
    ariaLabel,
    className,
    onDelete,
    onClose,
    type = 'default',
    disabled = false,
    id,
    size,
    variant,
    color,
    'aria-label': ariaLabelOverride,
  } = props;

  const handleDelete =
    onDelete ||
    (type === 'closable'
      ? (
          event?:
            | MouseEvent<HTMLButtonElement>
            | KeyboardEvent<HTMLButtonElement>,
        ) => onClose?.(event)
      : undefined);

  const {
    variant: muiVariant,
    size: muiSize,
    color: muiColor,
  } = transformTagPropsCore({
    size,
    variant,
    color,
    disabled,
    className,
    id,
  });

  const accessibleLabelText =
    typeof label === 'string'
      ? label
      : (ariaLabelOverride ?? ariaLabel ?? 'tag');

  const ariaLabelText =
    typeof label === 'string' ? undefined : (ariaLabelOverride ?? ariaLabel);

  const labelContent = useMemo(
    () => (
      <span className={moduleStyles.tagLabel}>
        {icon?.placement === 'left' && (
          <FontAwesomeV6Icon {...icon} className="tag-icon" />
        )}
        <span className={moduleStyles.tagLabelText}>{label}</span>
        {icon?.placement === 'right' && (
          <FontAwesomeV6Icon {...icon} className="tag-icon" />
        )}
        {handleDelete && (
          <button
            type="button"
            className="tag-close-button"
            onClick={event => handleDelete(event)}
            disabled={disabled}
            aria-label={`Close ${accessibleLabelText}`}
          >
            <FontAwesomeV6Icon iconName="close" />
          </button>
        )}
      </span>
    ),
    [icon, label, handleDelete, disabled, accessibleLabelText],
  );

  const chip = (
    <Chip
      id={id}
      className={classNames(
        'tag-chip',
        icon?.placement === 'left' && 'tag-has-icon-left',
        icon?.placement === 'right' && 'tag-has-icon-right',
        handleDelete && 'tag-has-action',
        className,
      )}
      size={muiSize}
      variant={muiVariant}
      color={muiColor}
      disabled={disabled || color === 'disabled'}
      label={labelContent}
      tabIndex={handleDelete ? undefined : 0}
      aria-label={ariaLabelText}
    />
  );

  if (tooltipContent && tooltipId) {
    return (
      <WithTooltip
        tooltipProps={{
          direction: 'onTop',
          text: tooltipContent,
          tooltipId,
        }}
      >
        {chip}
      </WithTooltip>
    );
  }

  return chip;
};

export default memo(Tag);
