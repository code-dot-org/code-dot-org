import classNames from 'classnames';
import React, {HTMLAttributes} from 'react';

import {LinkButton} from '@/button';
import {Heading3, BodyThreeText, OverlineTwoText} from '@/typography';

import moduleStyles from './actionBlock.module.scss';

export interface ActionBlockProps extends HTMLAttributes<HTMLElement> {
  /** Action Block title */
  title?: string;
  /** Action Block description */
  description?: string;
  /** Action Block image */
  imageSrc?: string;
  /** Action Block overline */
  overline?: string;
  /** Primary button label */
  primaryButtonLabel?: string;
  /** Primary button link */
  primaryButtonUrl?: string;
  /** Primary button aria label */
  primaryButtonAriaLabel?: string;
  /** Secondary button label */
  secondaryButtonLabel?: string;
  /** Secondary button link */
  secondaryButtonUrl?: string;
  /** Secondary button aria label */
  secondaryButtonAriaLabel?: string;
  /** Action Block background */
  background?: 'primary' | 'secondary';
  /** Action Block is full width */
  isFullWidth?: boolean;
  /** Action Block custom className */
  className?: string;
}

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
 * This component is used to display a content block with a title, description,
 * and up to two buttons. It can be full-width or fit within two or three columns.
 */
const ActionBlock: React.FC<ActionBlockProps> = ({
  title,
  description,
  imageSrc,
  overline,
  primaryButtonLabel,
  primaryButtonUrl,
  primaryButtonAriaLabel,
  secondaryButtonLabel,
  secondaryButtonUrl,
  secondaryButtonAriaLabel,
  background = 'primary',
  isFullWidth = true,
  className,
  ...HTMLAttributes
}: ActionBlockProps) => {
  return (
    <div
      className={classNames(
        moduleStyles.actionBlock,
        moduleStyles[`actionBlock-background-${background}`],
        moduleStyles[isFullWidth ? `isFullWidth` : ''],
        className,
      )}
      {...HTMLAttributes}
    >
      {imageSrc && (
        <img
          className={moduleStyles.image}
          src={imageSrc}
          alt={''}
          style={{
            background: `url(${imageSrc}) center center no-repeat`,
            backgroundSize: 'cover',
          }}
        />
      )}
      <div className={moduleStyles.contentWrapper}>
        {overline && (
          <OverlineTwoText className={classNames(moduleStyles.overline)}>
            {overline}
          </OverlineTwoText>
        )}
        <Heading3
          className={classNames(moduleStyles.title)}
          visualAppearance={isFullWidth ? 'heading-sm' : 'heading-md'}
        >
          {title}
        </Heading3>
        <BodyThreeText className={classNames(moduleStyles.description)}>
          {description}
        </BodyThreeText>
        <div className={moduleStyles.buttonWrapper}>
          {primaryButtonLabel && primaryButtonUrl && (
            <LinkButton
              href={primaryButtonUrl}
              text={primaryButtonLabel}
              type="primary"
              size="m"
              ariaLabel={primaryButtonAriaLabel}
            >
              {primaryButtonLabel}
            </LinkButton>
          )}
          {secondaryButtonLabel && secondaryButtonUrl && (
            <LinkButton
              href={secondaryButtonUrl}
              text={secondaryButtonLabel}
              type="secondary"
              size="m"
              color="black"
              ariaLabel={secondaryButtonAriaLabel}
            >
              {secondaryButtonLabel}
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionBlock;
