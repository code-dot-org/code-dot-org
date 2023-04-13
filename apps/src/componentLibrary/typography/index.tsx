import React from 'react';
import classnames from 'classnames';
// import styles from './Typography.module.scss';

const styles = require('./typography.module.scss').default;

type TypographyProps = {
  className?: string;
  children: React.ReactNode;
  semanticTag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  visualApproach: string;
  style?: React.CSSProperties;
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
  console.log(styles[visualApproach], className);

  return (
    <Tag
      className={classnames(styles[visualApproach], className )}
      style={style}
    >
      {children}
    </Tag>
  );
};

// Typography.propTypes = {
//   children: PropTypes.node,
//   semanticTag: PropTypes.oneOf(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']).isRequired,
//   visualApproach: PropTypes.string.isRequired
// };

export {default as Heading1} from './Heading1';
export default Typography;
