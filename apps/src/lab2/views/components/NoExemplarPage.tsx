import React from 'react';

import moduleStyles from './no-exemplar-page.module.scss';

const NoExemplarPage: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.noExemplarContainer}>
      No exemplar exists for this level.
    </div>
  );
};

export default NoExemplarPage;
