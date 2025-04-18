import classNames from 'classnames';

import {Heading3, BodyThreeText, OverlineTwoText} from '@/typography';

import {
  ActionBlockWrapper,
  getImage,
  getButtons,
  getDetail,
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
  overline,
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
      {image && getImage(image)}
      <div>
        {overline && (
          <OverlineTwoText className={classNames(moduleStyles.overline)}>
            {overline}
          </OverlineTwoText>
        )}
        <Heading3
          className={classNames(moduleStyles.title)}
          visualAppearance={'heading-sm'}
        >
          {title}
        </Heading3>
        <BodyThreeText className={classNames(moduleStyles.description)}>
          {description}
        </BodyThreeText>
        {details && getDetail(details)}
        {primaryButton && getButtons(primaryButton, secondaryButton)}
      </div>
    </ActionBlockWrapper>
  );
};

export default FullWidthActionBlock;
