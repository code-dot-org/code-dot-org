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
  /** Detail label */
  detailLabel?: string;
  /** Detail text */
  detailDescription?: string;
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

const getImage = (image?: string) => {
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

const getText = (
  title: string,
  description: string,
  overline?: string,
  detailLabel?: string,
  detailDescription?: string,
  isFullWidth?: boolean,
) => {
  return (
    <div className={moduleStyles.textWrapper}>
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
      {detailLabel && detailDescription && (
        <BodyThreeText className={classNames(moduleStyles.detail)}>
          <StrongText>{`${detailLabel}: `}</StrongText>
          {detailDescription}
        </BodyThreeText>
      )}
    </div>
  );
};

const getButtons = (
  primaryButtonLabel?: string,
  primaryButtonUrl?: string,
  primaryButtonAriaLabel?: string,
  secondaryButtonLabel?: string,
  secondaryButtonUrl?: string,
  secondaryButtonAriaLabel?: string,
) => {
  return (
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
 * This component is used to display a content block with a title, description,
 * and up to two buttons. It can be full-width or fit within two or three columns.
 */
const ActionBlock: React.FC<ActionBlockProps> = ({
  title,
  description,
  image,
  overline,
  detailLabel,
  detailDescription,
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
      {/* Organize content to work with layout styles when full width */}
      {isFullWidth ? (
        <>
          {image && <>{getImage(image)}</>}
          <div>
            {getText(
              title,
              description,
              overline,
              detailLabel,
              detailDescription,
              isFullWidth,
            )}
            {primaryButtonLabel && (
              <>
                {getButtons(
                  primaryButtonLabel,
                  primaryButtonUrl,
                  primaryButtonAriaLabel,
                  secondaryButtonLabel,
                  secondaryButtonUrl,
                  secondaryButtonAriaLabel,
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Organize content to work with layout styles when not full width */}
          <div>
            {image && <>{getImage(image)}</>}
            {getText(
              title,
              description,
              overline,
              detailLabel,
              detailDescription,
              isFullWidth,
            )}
          </div>
          {primaryButtonLabel && (
            <>
              {getButtons(
                primaryButtonLabel,
                primaryButtonUrl,
                primaryButtonAriaLabel,
                secondaryButtonLabel,
                secondaryButtonUrl,
                secondaryButtonAriaLabel,
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ActionBlock;
