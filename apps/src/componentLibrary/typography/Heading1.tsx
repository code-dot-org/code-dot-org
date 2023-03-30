import React from 'react';
import PropTypes from 'prop-types';

type Heading1Props = {
  children: React.ReactNode;
};

const Heading1 = ({children}: Heading1Props) => {
  return <h1>{children}</h1>;
};

Heading1.propTypes = {
  children: PropTypes.node
};
export default Heading1;
