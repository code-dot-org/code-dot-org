import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {LinkButton} from '@/button';
import {
  Heading3,
  BodyThreeText,
  OverlineTwoText,
  StrongText,
} from '@/typography';

import moduleStyles from './actionBlock.module.scss';

export interface ActionBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Action Block title */
  title: string;
  /** Action Block description */
  description: string;
  /** Action Block image */
  image?: string;
  /** Action Block overline */
  overline?: string;
  /** Action Block detail */
  detail?: 'none' | 'duration' | 'labProject';
  /** Detail label */
  detailLabel?: string;
  /** Detail string */
  detailString?: string;
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
  image,
  overline,
  detail = 'none',
  detailLabel,
  detailString,
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
}) => {
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
      {image && (
        // The image is decorative, so using a <figure> element instead of <img>
        // to avoid adding a border when the src is empty. The image is set as a
        // background to maintain the aspect ratio so any image size can be used.
        <figure
          style={{
            background: `url(${image}) center / cover no-repeat`,
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
        {(detail === 'duration' || detail === 'labProject') && detailString && (
          <BodyThreeText className={classNames(moduleStyles.detail)}>
            <StrongText>
              {detail === 'duration' ? 'Duration:' : detailLabel}
              {detail === 'labProject' ? 'What you can make:' : detailLabel}
            </StrongText>
            {' ' + detailString}
          </BodyThreeText>
        )}
        {primaryButtonLabel && primaryButtonUrl && (
          <div className={moduleStyles.buttonWrapper}>
            {primaryButtonLabel && primaryButtonUrl && (
              <LinkButton
                href={primaryButtonUrl}
                text={primaryButtonLabel}
                type="primary"
                size="m"
                ariaLabel={primaryButtonAriaLabel}
                role={'button'}
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
                role={'button'}
              >
                {secondaryButtonLabel}
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionBlock;
