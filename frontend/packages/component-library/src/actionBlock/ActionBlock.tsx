import classNames from 'classnames';

import {LinkButton, LinkButtonProps} from '@/button';
import Image, {ImageProps} from '@/image';
import {
  Heading3,
  BodyThreeText,
  OverlineTwoText,
  StrongText,
  BodyFourText,
} from '@/typography';
import Video, {VideoProps} from '@/video';

import {ActionBlockProps, ActionBlockWrapperProps} from './types';

import moduleStyles from './actionBlock.module.scss';

export const getImage = (image?: ImageProps) => {
  if (!image) return null;
  return <Image src={image.src} loading="lazy" alt="" />;
};

export const getVideo = (VideoComponent?: typeof Video, video?: VideoProps) => {
  if (!video) return null;
  if (!VideoComponent) {
    return (
      <div>
        VideoComponent is not provided. Please provide VideoComponent in order
        to render a video.
      </div>
    );
  }

  return (
    <div className={moduleStyles.videoWrapper}>
      <VideoComponent {...video} />
    </div>
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
          type="primary"
          size="m"
          color="purple"
          text={primaryButton.text}
          href={primaryButton.href}
          ariaLabel={primaryButton.ariaLabel}
          {...primaryButton}
        />
      )}
      {secondaryButton && (
        <LinkButton
          type="secondary"
          size="m"
          color="black"
          text={secondaryButton.text}
          href={secondaryButton.href}
          ariaLabel={secondaryButton.ariaLabel}
          {...secondaryButton}
        />
      )}
    </div>
  );
};

export const getTag = (tag: string) => {
  return (
    <BodyFourText className={classNames(moduleStyles.tag)}>{tag}</BodyFourText>
  );
};

export const ActionBlockWrapper: React.FC<ActionBlockWrapperProps> = ({
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
  video,
  VideoComponent,
  overline,
  tag,
  details,
  primaryButton,
  secondaryButton,
  background,
  className,
  ...HTMLAttributes
}) => {
  return (
    <ActionBlockWrapper
      background={background}
      className={classNames(moduleStyles.oneColumn, className)}
      {...HTMLAttributes}
    >
      <div>
        {tag && getTag(tag)}
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
        {video ? getVideo(VideoComponent, video) : image && getImage(image)}
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
