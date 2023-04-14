import React from 'react';
import classnames from 'classnames';

const styles = require('./typography.module.scss').default;

type SemanticTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'strong'
  | 'em'
  | 'figcaption';

type VisualApproach =
  | 'heading-xxl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
  | 'body-one'
  | 'body-two'
  | 'overline'
  | 'strong'
  | 'em'
  | 'figcaption';

interface TypographyProps {
  // Html tag to use for the typography element
  semanticTag: SemanticTag;
  // Scss module classname to use for the typography element
  visualApproach?: VisualApproach;

  // Additional classnames to apply to the typography element
  className?: string;
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
}

const Typography: React.FunctionComponent<TypographyProps> = ({
  semanticTag,
  visualApproach,
  children,
  className,
  style
}) => {
  const Tag = semanticTag;

  return (
    <Tag
      className={classnames(
        visualApproach && styles[visualApproach],
        className
      )}
      style={style}
    >
      {children}
    </Tag>
  );
};

export {SemanticTag, VisualApproach};
export {default as Heading1} from './components/Heading1';
export {default as Heading2} from './components/Heading2';
export {default as Heading3} from './components/Heading3';
export {default as Heading4} from './components/Heading4';
export {default as Heading5} from './components/Heading5';
export {default as Heading6} from './components/Heading6';
export {default as BodyOneText} from './components/BodyOneText';
export {default as BodyTwoText} from './components/BodyTwoText';
export {default as OverlineText} from './components/OverlineText';
export {default as StrongText} from './components/StrongText';
export {default as EmText} from './components/EmText';
export {default as Figcaption} from './components/Figcaption';
export default Typography;
