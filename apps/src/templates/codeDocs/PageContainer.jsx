import React from 'react';
import PropTypes from 'prop-types';
import NavigationBar from './NavigationBar';
import ProgrammingExpressionOverview from './ProgrammingExpressionOverview';

export default function PageContainer({
  programmingExpression,
  categoriesForNavigation,
  programmingEnvironmentTitle
}) {
  return (
    <div>
      <h1>{programmingEnvironmentTitle}</h1>
      <div style={{display: 'flex', gap: 10}}>
        <NavigationBar categoriesForNavigation={categoriesForNavigation} />
        <ProgrammingExpressionOverview
          programmingExpression={programmingExpression}
        />
      </div>
    </div>
  );
}

PageContainer.propTypes = {
  programmingExpression: PropTypes.object.isRequired,
  categoriesForNavigation: PropTypes.arrayOf(PropTypes.object).isRequired,
  programmingEnvironmentTitle: PropTypes.string.isRequired
};
