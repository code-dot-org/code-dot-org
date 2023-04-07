import React from 'react';
import classnames from 'classnames';

type TypographyProps = {
  children: React.ReactNode;
  semanticTag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  visualApproach: string;
};
const Typography: React.FunctionComponent<TypographyProps> = ({
  semanticTag,
  visualApproach,
  children
}) => {
  const Tag = semanticTag;

  return <Tag className={classnames('a', 'b')}>{children}</Tag>;
};

// Typography.propTypes = {
//   children: PropTypes.node,
//   semanticTag: PropTypes.oneOf(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']).isRequired,
//   visualApproach: PropTypes.string.isRequired
// };

export {default as Heading1} from './Heading1';
export default Typography;
