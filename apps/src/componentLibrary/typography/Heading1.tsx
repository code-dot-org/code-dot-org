import React from 'react';

type Heading1Props = {
  children: React.ReactNode;
};

const Heading1 = ({children}: Heading1Props) => {
  // const {children} = props;
  return <h1>{children}</h1>;
};

export default Heading1;
