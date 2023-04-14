import React from 'react';
import classnames from 'classnames';
// import styles from './Typography.module.scss';

const styles = require('./typography.module.scss').default;

type TypographyProps = {
  // Html tag to use for the typography element
  semanticTag:
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
  // Scss module classname to use for the typography element
  visualApproach?:
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
    | 'em';
  // Inline styles to apply to the typography element
  style?: React.CSSProperties;
  // Additional classnames to apply to the typography element
  className?: string;
  // Text or other elements to render inside the typography element
  children: React.ReactNode;
};
const Typography: React.FunctionComponent<TypographyProps> = ({
  semanticTag,
  visualApproach,
  children,
  className,
  style
}) => {
  const Tag = semanticTag;
  console.log(styles);
  console.log(visualApproach);
  // console.log(styles[visualApproach], className);

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

export {default as Heading1} from './Heading1';
export default Typography;
