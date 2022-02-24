import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import CodeDocLink from '@cdo/apps/templates/codeDocs/CodeDocLink';
import i18n from '@cdo/locale';
import {TextLink} from '@dsco_/link';

export function CategorySection({category}) {
  return (
    <div>
      <h3
        style={{
          paddingLeft: 15,
          color: 'black',
          backgroundColor: category.color
        }}
      >
        {category.name}
      </h3>
      <ul>
        {category.programmingExpressions.map(expression => (
          <li key={expression.key}>
            <CodeDocLink programmingExpression={expression} />
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
      {programmingEnvironment.title && <h1>{programmingEnvironment.title}</h1>}
      {programmingEnvironment.description && (
        <EnhancedSafeMarkdown markdown={programmingEnvironment.description} />
      )}
      {programmingEnvironment.projectUrl && (
        <div>
          <TextLink
            href={programmingEnvironment.projectUrl}
            weight="medium"
            text={i18n.tryItOut()}
          />
        </div>
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
