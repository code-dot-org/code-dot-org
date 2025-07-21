import OpenInNew from '@mui/icons-material/OpenInNew';
import MuiButton from '@mui/material/Button';
import classNames from 'classnames';
import {EntryFields} from 'contentful';

type ButtonProps = {
  /** Button text */
  text?: string;
  /** Button type (semantic) */
  type: 'emphasized' | 'primary' | 'secondary';
  /** Button size */
  size: 'small' | 'medium' | 'large';
  /** Button link href */
  href?: string;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal?: boolean;
  /** Aria label for the button */
  ariaLabel?: EntryFields.Text;
  /** Custom classname */
  className?: string;
};

const Button: React.FunctionComponent<ButtonProps> = ({
  text,
  type,
  size,
  href,
  isLinkExternal = false,
  ariaLabel,
  className,
}) => {
  return href ? (
    <MuiButton
      className={classNames(`button--color-${type}`, className)}
      variant={
        type === 'emphasized' || type === 'primary' ? 'contained' : 'outlined'
      }
      size={size}
      href={href}
      target={isLinkExternal ? '_blank' : undefined}
      rel={isLinkExternal ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      endIcon={isLinkExternal ? <OpenInNew /> : undefined}
      disableElevation
      disableRipple
    >
      {text}
    </MuiButton>
  ) : null;
};

export default Button;
