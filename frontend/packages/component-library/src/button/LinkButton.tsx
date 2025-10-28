import {memo} from 'react';

import GenericButton, {
  CoreButtonProps,
  LinkButtonSpecificProps,
} from './GenericButton';

export interface LinkButtonProps
  extends CoreButtonProps,
    LinkButtonSpecificProps {}

const LinkButton: React.FunctionComponent<LinkButtonProps> = props => (
  <GenericButton useAsLink {...props} />
);

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Link Button Component.
 *
 * Alias for ***GenericButton*** Component. Renders a Button with ```<a>``` html tag.
 *
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
export default memo(LinkButton);
