import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import {
  FunctionComponent,
  MouseEvent,
  KeyboardEvent,
  Key,
  HTMLAttributes,
  memo,
  useCallback,
  ReactElement,
  ReactNode,
} from 'react';

import CloseButton from '@/closeButton/CloseButton';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './tags.module.scss';

type TagIconProps = FontAwesomeV6IconProps & {
  placement: 'left' | 'right';
};

export type TagColor = 'default' | 'pink';

const TagIcon: FunctionComponent<TagIconProps> = memo(
  ({iconName, iconStyle, iconFamily, title}) => (
    <FontAwesomeV6Icon
      iconName={iconName}
      iconStyle={iconStyle}
      iconFamily={iconFamily}
      title={title}
    />
  ),
);

export interface BaseTagProps {
  /** Tag label */
  label: string;
  /** Tag tooltip content. Can be a simple string or ReactNode (some jsx/html markup/view).
   *  For example - check Tags.story.tsx
   *  Can be null to disable the tooltip */
  tooltipContent?: string | ReactNode;
  /** Tag tooltip id (required for better accessibility, see ) */
  tooltipId?: string;
  /** aria-label for the tag.
   *  Used to allow screen reader to read tag as ariaLabel content instead of the label content */
  ariaLabel?: string;
  /** Icon (object) to show next to text label (optional).
   *  Icon object consists of icon(icon name/style, title for screenReader,
   *  and the placement of the icon (left or right))*/
  icon?: TagIconProps;
  /** Unique key */
  key?: Key;
  /** Tag color. Defaults to the neutral tag. */
  color?: TagColor;
}

export interface DefaultTagProps extends BaseTagProps {
  type?: 'default';
}

export interface ClosableTagProps extends BaseTagProps {
  type: 'closable';
  /** onClose callback gives the tag an accessible close button on the
   * right side of the label */
  onClose: (
    e?: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => void;
}

export type TagProps = DefaultTagProps | ClosableTagProps;

const Tag: FunctionComponent<TagProps> = props => {
  const {
    label,
    ariaLabel,
    tooltipContent,
    tooltipId,
    icon,
    color = 'default',
    type = 'default',
  } = props;
  const tooltipWrapper = useCallback(
    (children: ReactElement) =>
      tooltipContent && tooltipId ? (
        <Tooltip id={tooltipId} title={tooltipContent} placement="top">
          {children}
        </Tooltip>
      ) : (
        children
      ),
    [tooltipContent, tooltipId],
  );

  const containerAttrs: HTMLAttributes<HTMLDivElement> = {
    className: classNames(moduleStyles.tag, moduleStyles[`tag-${color}`]),
    tabIndex: 0,
    'aria-label': ariaLabel,
  };

  if (type === 'closable') {
    delete containerAttrs.tabIndex;
    const {onClose} = props as ClosableTagProps;
    return tooltipWrapper(
      <div {...containerAttrs}>
        <span>{label}</span>
        <CloseButton
          onClick={onClose}
          aria-label={`Close ${ariaLabel ?? label}`}
        />
      </div>,
    );
  }

  if (type === 'default') {
    return tooltipWrapper(
      <div {...containerAttrs}>
        {icon && icon.placement === 'left' && <TagIcon {...icon} />}
        <span>{label}</span>
        {icon && icon.placement === 'right' && <TagIcon {...icon} />}
      </div>,
    );
  }
};

export default memo(Tag);
