import PropTypes from 'prop-types';
import React from 'react';

import {
  NavigationBar,
  NavigationCategory,
  NavigationItem,
} from '@cdo/apps/templates/NavigationBar';
import i18n from '@cdo/locale';

export default function PageContainer({
  children,
  categoriesForNavigation,
  programmingEnvironmentTitle,
  currentCategoryKey,
  currentDocId,
}) {
  return (
    <>
      <h1>
        {i18n.programmingEnvironmentDocumentation({
          programmingEnvironmentTitle,
        })}
      </h1>
      <div
        style={{display: 'flex', gap: 25, width: '100%'}}
        className="page-content"
      >
        <NavigationBar initialCategoryKey={currentCategoryKey}>
          {categoriesForNavigation.map(category => (
            <NavigationCategory
              key={category.key}
              name={category.name}
              color={category.color}
              initialIsOpen={category.key === currentCategoryKey}
              useColorWhenClosed
            >
              {category.docs.map(doc => (
                <NavigationItem
                  key={doc.key}
                  text={doc.name}
                  indentLevel={1}
                  href={doc.link}
                  isActive={doc.id === currentDocId}
                />
              ))}
            </NavigationCategory>
          ))}
        </NavigationBar>
        {children}
      </div>
    </>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  categoriesForNavigation: PropTypes.arrayOf(PropTypes.object).isRequired,
  programmingEnvironmentTitle: PropTypes.string.isRequired,
  currentCategoryKey: PropTypes.string,
  currentDocId: PropTypes.number,
};
