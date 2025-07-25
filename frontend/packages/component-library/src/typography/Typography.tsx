import classnames from 'classnames';
import {memo, ReactNode, CSSProperties} from 'react';

import {SemanticTag, VisualAppearance} from './types';

import moduleStyles from '@code-dot-org/component-library-styles/typography.module.scss';

export interface TypographyProps {
  /** Html tag to use for the typography element */
  semanticTag: SemanticTag;
  /** Scss module classname to use for the typography element */
  visualAppearance: VisualAppearance;
  /** Additional classnames to apply to the typography element */
  className?: string;
  /** Inline styles to apply to the typography element */
  style?: CSSProperties;
  /** Text or other elements to render inside the typography element */
  children: ReactNode;
  /** Typography element id */
  id?: string;
  /** Typography without margins */
  noMargin?: boolean;
}

const Typography: React.FunctionComponent<TypographyProps> = ({
  semanticTag,
  visualAppearance,
  children,
  className,
  style,
  id,
  noMargin = false,
  ...props
}) => {
  const Tag = semanticTag;

  return (
    <Tag
      id={id}
      className={classnames(
        moduleStyles[visualAppearance],
        {
          [moduleStyles['no-margin']]: noMargin,
          [moduleStyles.wrapper]: semanticTag === 'div',
        },
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default memo(Typography);
