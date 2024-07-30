import classnames from 'classnames';
import React from 'react';

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
  onClose,
}) => {
  return (
    <div className={classnames(moduleStyles.popover)}>
      <CloseButton onClick={onClose} aria-label={'Close'} />
      {image && <img src={image.src} alt={image.alt} />}
      {icon && <FontAwesomeV6Icon {...icon} />}
      <Heading5>{title}</Heading5>
      <BodyTwoText>{content}</BodyTwoText>

      {/*{content}*/}
      {/*{button1}*/}
      {/*{button2}*/}
    </div>
  );
};

export default Popover;
