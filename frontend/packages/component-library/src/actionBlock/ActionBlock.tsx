import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {LinkButton, LinkButtonProps} from '@/button';
import {
  Heading3,
  BodyThreeText,
  OverlineTwoText,
  StrongText,
} from '@/typography';

import moduleStyles from './actionBlock.module.scss';

export interface ActionBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Action Block title */
  title?: string;
  /** Action Block description */
  description?: string;
  /** Action Block image */
  image?: string;
  /** Action Block overline */
  overline?: string;
  /** Action Block Details */
  details?: {
    /** Detail label */
    label: string;
    /** Detail text */
    description: string;
  };
  /** Primary button props */
  primaryButton?: LinkButtonProps;
  /** Secondary button props */
  secondaryButton?: LinkButtonProps;
  /** Action Block background */
  background?: 'primary' | 'secondary';
  /** Action Block custom className */
  className?: string;
}

export const getImage = (image?: string) => {
  if (!image) return null;
  return (
    // The image is decorative, so using a <figure> element instead of <img>
    // to avoid adding a border when the src is empty. The image is set as a
    // background to maintain the aspect ratio so any image size can be used.
    <figure
      style={{
        background: `url(${image}) center / cover no-repeat`,
      }}
    />
  );
};

export const getDetail = (details?: {label: string; description: string}) => {
  if (!details) return null;
  return (
    <BodyThreeText className={classNames(moduleStyles.detail)}>
      <StrongText>{`${details.label}: `}</StrongText>
      {details.description}
    </BodyThreeText>
  );
};

export const getButtons = (
  primaryButton?: LinkButtonProps,
  secondaryButton?: LinkButtonProps,
) => {
  if (!primaryButton) return null;
  return (
    <div className={moduleStyles.buttonWrapper}>
      {primaryButton && (
        <LinkButton
          {...primaryButton}
          type="primary"
          size="m"
          color="purple"
          text={primaryButton.text}
          href={primaryButton.href}
          ariaLabel={primaryButton.ariaLabel}
        />
      )}
      {secondaryButton && (
        <LinkButton
          {...secondaryButton}
          type="secondary"
          size="m"
          color="black"
          text={secondaryButton.text}
          href={secondaryButton.href}
          ariaLabel={secondaryButton.ariaLabel}
        />
      )}
    </div>
  );
};

export const ActionBlockWrapper: React.FC<ActionBlockProps> = ({
  background = 'primary',
  className,
  children,
  ...HTMLAttributes
}) => {
  return (
    <div
      className={classNames(
        moduleStyles.actionBlock,
        moduleStyles[`actionBlock-background-${background}`],
        className,
      )}
      {...HTMLAttributes}
    >
      {children}
    </div>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/ActionBlock.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Action Block Component.
 * This component is used to display a content block with a call to action.
 * Multiple can fit within two or three columns, or a single one can be full width.
 */
export const ActionBlock: React.FC<ActionBlockProps> = ({
  title,
  description,
  image,
  overline,
  details,
  primaryButton,
  secondaryButton,
}) => {
  return (
    <ActionBlockWrapper className={moduleStyles.oneColumn}>
      <div>
        {overline && (
          <OverlineTwoText className={classNames(moduleStyles.overline)}>
            {overline}
          </OverlineTwoText>
        )}
        <Heading3
          className={classNames(moduleStyles.title)}
          visualAppearance={'heading-md'}
        >
          {title}
        </Heading3>
        {image && getImage(image)}
        <BodyThreeText className={classNames(moduleStyles.description)}>
          {description}
        </BodyThreeText>
        {details && getDetail(details)}
      </div>
      {primaryButton && getButtons(primaryButton, secondaryButton)}
    </ActionBlockWrapper>
  );
};

export default ActionBlock;
