import React from 'react';
import PropTypes from 'prop-types';
import NavigationBar from './NavigationBar';

export default function PageContainer({
  children,
  categoriesForNavigation,
  programmingEnvironmentTitle
}) {
  return (
    <div>
      <h1>{programmingEnvironmentTitle}</h1>
      <div style={{display: 'flex', gap: 10}}>
        <NavigationBar categoriesForNavigation={categoriesForNavigation} />
        {children}
      </div>
    </div>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  categoriesForNavigation: PropTypes.arrayOf(PropTypes.object).isRequired,
  programmingEnvironmentTitle: PropTypes.string.isRequired
};
