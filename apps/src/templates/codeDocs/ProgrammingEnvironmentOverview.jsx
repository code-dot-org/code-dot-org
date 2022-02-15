import React, {createRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import StyledCodeBlock from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

function CategorySection({category}) {
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
          <li key={expression.name}>
            <StyledCodeBlock programmingExpression={expression} />
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
      <h1>{programmingEnvironment.title}</h1>
      <div>{programmingEnvironment.description}</div>
      {programmingEnvironment.categories.map(category => (
        <CategorySection key={category.key} category={category} />
      ))}
    </div>
  );
}
