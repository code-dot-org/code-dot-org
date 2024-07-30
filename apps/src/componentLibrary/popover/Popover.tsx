import classnames from 'classnames';
import React, {ReactNode} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {BodyTwoText, Heading5} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './popover.module.scss';

export interface PopoverProps {
  title: string;
  direction?: 'onTop' | 'onRight' | 'onBottom' | 'onLeft' | 'none';
  icon?: FontAwesomeV6IconProps;
  image?: {
    src: string;
    alt: string;
  };
  content: string;
  onClose: () => void;
  buttons?: ReactNode;
}

// TODO:
// - Add tests
// - Add stories
// - Add documentation
// - add implementation
// - add styles
// - update Readme
// - update index
// - ✔ update Changelog ✔

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/TabsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 *
 * Design System: Popover Component.
 * Can be used to render a Popover.
 */
const Popover: React.FunctionComponent<PopoverProps> = ({
  icon,
  image,
  title,
  content,
  buttons,
  onClose,
}) => {
  return (
    <div
      className={classnames(
        moduleStyles.popover,
        image && moduleStyles['popover-withImage']
      )}
    >
      <CloseButton
        className={moduleStyles.closeButton}
        onClick={onClose}
        aria-label={'Close'}
      />
      <div>
        {image && <img src={image.src} alt={image.alt} />}
        {icon && !image && <FontAwesomeV6Icon {...icon} />}
      </div>
      <div className={moduleStyles.contentSection}>
        <Heading5>{title}</Heading5>
        <BodyTwoText>{content}</BodyTwoText>
        <div className={moduleStyles.buttonsSection}>{buttons}</div>
      </div>
    </div>
  );
};

export default Popover;
