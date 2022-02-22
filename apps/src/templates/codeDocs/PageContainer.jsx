import React from 'react';
import PropTypes from 'prop-types';
import NavigationBar from './NavigationBar';
import i18n from '@cdo/locale';

export default function PageContainer({
  children,
  categoriesForNavigation,
  programmingEnvironmentTitle,
  currentCategoryKey
}) {
  return (
    <div>
      <h1>
        {i18n.programmingEnvironmentDocumentation({
          programmingEnvironmentTitle
        })}
      </h1>
      <div style={{display: 'flex', gap: 10, width: '100%'}}>
        <NavigationBar
          categoriesForNavigation={categoriesForNavigation}
          currentCategoryKey={currentCategoryKey}
        />
        {children}
      </div>
    </div>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  categoriesForNavigation: PropTypes.arrayOf(PropTypes.object).isRequired,
  programmingEnvironmentTitle: PropTypes.string.isRequired,
  currentCategoryKey: PropTypes.string
};
