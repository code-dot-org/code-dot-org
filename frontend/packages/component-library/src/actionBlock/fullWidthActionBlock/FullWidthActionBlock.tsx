import {Typography} from '@mui/material';
import classNames from 'classnames';

import {
  ActionBlockWrapper,
  getImage,
  getVideo,
  getButtons,
  getDetail,
  getTag,
} from '../ActionBlock';
import {ActionBlockProps} from '../types';

import moduleStyles from '../actionBlock.module.scss';

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/FullWidthActionBlock.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Full Width Action Block Component.
 * This component is used to render a full-width action block that's designed to be
 * used in a layout where the action block takes up the full width of its container.
 */
export const FullWidthActionBlock: React.FC<ActionBlockProps> = ({
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
      className={classNames(moduleStyles.fullWidth, className)}
      {...HTMLAttributes}
    >
      {tag && getTag(tag)}
      {video ? getVideo(VideoComponent, video) : image && getImage(image)}
      <div>
        {overline && (
          <Typography
            className={classNames(moduleStyles.overline)}
            variant="overline2"
            gutterBottom
          >
            {overline}
          </Typography>
        )}
        <Typography
          className={classNames(moduleStyles.title)}
          component="h3"
          variant="h5"
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          className={classNames(moduleStyles.description)}
          variant="body3"
          gutterBottom
        >
          {description}
        </Typography>
        {details && getDetail(details)}
        {primaryButton && getButtons(primaryButton, secondaryButton)}
      </div>
    </ActionBlockWrapper>
  );
};

export default FullWidthActionBlock;
