import classNames from 'classnames';

import {LinkButton} from '@/button';
import {Heading3, BodyThreeText, OverlineTwoText} from '@/typography';

import moduleStyles from './actionBlock.module.scss';

export interface ActionBlockProps extends React.HTMLAttributes<HTMLElement> {
  /** Action Block title */
  title: string;
  /** Action Block description */
  description: string;
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
  /** Action Block overline */
  overline?: string;
  /** Action Block background */
  background?: 'primary' | 'secondary';
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
  primaryButtonLabel,
  primaryButtonUrl,
  primaryButtonAriaLabel,
  secondaryButtonLabel,
  secondaryButtonUrl,
  secondaryButtonAriaLabel,
  overline,
  background = 'primary',
  className,
  ...HTMLAttributes
}: ActionBlockProps) => {
  return (
    <div
      className={classNames(
        moduleStyles.actionBlock,
        moduleStyles[`actionBlock-background-${background}`],
        className,
      )}
      {...HTMLAttributes}
    >
      {overline && <OverlineTwoText>{overline}</OverlineTwoText>}
      <Heading3 visualAppearance="heading-md">{title}</Heading3>
      <BodyThreeText>{description}</BodyThreeText>
      <div className={moduleStyles.buttons}>
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
            ariaLabel={secondaryButtonAriaLabel}
          >
            {secondaryButtonLabel}
          </LinkButton>
        )}
      </div>
    </div>
  );
};

export default ActionBlock;
