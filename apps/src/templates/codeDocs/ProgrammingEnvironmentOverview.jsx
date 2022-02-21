import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import CodeDocLink from '@cdo/apps/templates/codeDocs/CodeDocLink';

export function CategorySection({category}) {
  return (
    <div>
      <h3
        style={{
          paddingLeft: 15,
          color: 'black',
          backgroundColor: category.color,
          width: '100%'
        }}
      >
        {category.name}
      </h3>
      <ul>
        {category.programmingExpressions.map(expression => (
          <li key={expression.key}>
            <CodeDocLink programmingExpression={expression} showBlocks />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProgrammingEnvironmentOverview({
  programmingEnvironment
}) {
  return (
    <div>
      {programmingEnvironment.description && (
        <EnhancedSafeMarkdown markdown={programmingEnvironment.description} />
      )}
      {programmingEnvironment.categories.map(category => (
        <CategorySection key={category.key} category={category} />
      ))}
    </div>
  );
}

const categoryShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  programmingExpressions: PropTypes.arrayOf(PropTypes.object)
});

CategorySection.propTypes = {
  category: categoryShape.isRequired
};

ProgrammingEnvironmentOverview.propTypes = {
  programmingEnvironment: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    categories: PropTypes.arrayOf(categoryShape)
  }).isRequired
};
