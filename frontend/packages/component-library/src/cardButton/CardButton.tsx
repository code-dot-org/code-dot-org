import ButtonBase, {ButtonBaseProps} from '@mui/material/ButtonBase';
import classNames from 'classnames';
import {CSSProperties, forwardRef, ReactNode, Ref, useId} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import styles from './cardButton.module.scss';

export type CardButtonLayout = 'horizontal' | 'vertical';
export type CardButtonSize = 'medium' | 'small';

// Ripple props do nothing because the ripple is always off; `component` would
// hide a link from the href check; `sx` would bypass the SCSS module.
type CardButtonBaseProps = Omit<
  ButtonBaseProps,
  | 'children'
  | 'title'
  | 'disableRipple'
  | 'centerRipple'
  | 'focusRipple'
  | 'disableTouchRipple'
  | 'TouchRippleProps'
  | 'touchRippleRef'
  | 'component'
  | 'LinkComponent'
  | 'sx'
> & {
  size?: CardButtonSize;
  /** Primary text, and the card's accessible name. */
  title: ReactNode;
  /** Supporting text under the title, and the card's accessible description. */
  description?: ReactNode;
  /**
   * Selected chrome for a chosen option. A boolean sets `aria-pressed` on a
   * button, and `aria-current` on a link when true. With an explicit `role`,
   * no state attribute is set; pass the one the role needs, e.g. `aria-checked`.
   * Leave it undefined on plain action or navigation cards.
   */
  selected?: boolean;
  /** Fill the container width instead of hugging the content. */
  fullWidth?: boolean;
  /** Renders the card as a link. A disabled card renders a button instead. */
  href?: string;
  target?: string;
  rel?: string;
};

type CardButtonLayoutProps =
  | {
      /** `horizontal` for list rows, `vertical` for side-by-side choice tiles. */
      layout?: 'horizontal';
      /** Trailing icon, e.g. `chevron-right`. Horizontal layout only. */
      endIcon?: FontAwesomeV6IconProps;
    }
  | {
      layout: 'vertical';
      endIcon?: never;
    };

type CardButtonStartProps =
  | {
      /** Leading icon. Solid unless `iconStyle` or `iconFamily` is set. */
      startIcon?: FontAwesomeV6IconProps;
      /**
       * Any CSS color for `startIcon`, preferably a semantic token such as
       * `var(--text-info-primary)`. Selected and disabled cards use their own.
       */
      startIconColor?: string;
      startContent?: never;
    }
  | {
      /**
       * Decorative, non-interactive leading content in place of `startIcon`,
       * e.g. an avatar. It is at least the icon box in size and keeps its own
       * colors in every state.
       */
      startContent: ReactNode;
      startIcon?: never;
      startIconColor?: never;
    };

export type CardButtonProps = CardButtonBaseProps &
  CardButtonLayoutProps &
  CardButtonStartProps;

const hasContent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== '';

const renderIcon = (icon: FontAwesomeV6IconProps, className: string) => (
  <span className={className} aria-hidden>
    <FontAwesomeV6Icon {...icon} />
  </span>
);

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/CardButton.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Card Button Component.
 * A clickable card for actions, navigation and choices that need more presence
 * than a Button: a leading icon, a title, optional supporting text and an
 * optional trailing icon. Built on MUI `ButtonBase`; pass `href` for a link.
 */
const CardButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  CardButtonProps
>(
  (
    {
      layout = 'horizontal',
      size = 'medium',
      title,
      description,
      startIcon,
      startIconColor,
      startContent,
      endIcon,
      selected,
      fullWidth = false,
      className,
      style,
      href,
      target,
      rel,
      ...rest
    },
    ref,
  ) => {
    const titleId = useId();
    const descriptionId = useId();
    const showStartContent = hasContent(startContent);
    const showDescription = hasContent(description);
    // A disabled <a> stays followable by screen readers; a disabled <button> does not.
    const isLink = href !== undefined && !rest.disabled;
    const announceSelected = selected !== undefined && !rest.role;
    const namedByConsumer =
      rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined;

    return (
      <ButtonBase
        ref={ref as Ref<HTMLButtonElement>}
        disableRipple
        aria-pressed={announceSelected && !isLink ? selected : undefined}
        aria-current={announceSelected && isLink && selected ? true : undefined}
        aria-labelledby={namedByConsumer ? undefined : titleId}
        aria-describedby={
          namedByConsumer || !showDescription ? undefined : descriptionId
        }
        {...(isLink ? {href, target, rel} : {})}
        {...rest}
        className={classNames(
          styles.cardButton,
          styles[`cardButton-${layout}`],
          styles[`cardButton-${size}`],
          selected && styles['cardButton-selected'],
          fullWidth && styles['cardButton-fullWidth'],
          className,
        )}
        style={
          startIconColor && !showStartContent
            ? ({
                ...style,
                '--card-button-start-custom': startIconColor,
              } as CSSProperties)
            : style
        }
      >
        {showStartContent ? (
          <span className={styles.startContent}>{startContent}</span>
        ) : (
          startIcon && renderIcon(startIcon, styles.startIcon)
        )}
        <span className={styles.content}>
          <span id={titleId} className={styles.title}>
            {title}
          </span>
          {showDescription && (
            <span id={descriptionId} className={styles.description}>
              {description}
            </span>
          )}
        </span>
        {layout === 'horizontal' &&
          endIcon &&
          renderIcon(endIcon, styles.endIcon)}
      </ButtonBase>
    );
  },
);

CardButton.displayName = 'CardButton';

export default CardButton;
