import PropTypes from 'prop-types';
import React from 'react';

import {
  NavigationBar,
  NavigationCategory,
  NavigationItem,
} from '@cdo/apps/templates/NavigationBar';
import ReferenceGuide from '@cdo/apps/templates/referenceGuides/ReferenceGuide';
import {organizeReferenceGuides} from '@cdo/apps/util/referenceGuideHelpers';

const referenceGuideShape = PropTypes.shape({
  key: PropTypes.string,
  display_name: PropTypes.string,
  content: PropTypes.string,
  position: PropTypes.number,
  parent_reference_guide_key: PropTypes.string,
});

export default function ReferenceGuideView({
  referenceGuide,
  referenceGuides,
  baseUrl,
}) {
  let rootCategory = referenceGuide;
  while (rootCategory.parent_reference_guide_key !== null) {
    rootCategory = referenceGuides.find(
      guide => guide.key === rootCategory.parent_reference_guide_key
    );
  }
  const topLevelGuides = referenceGuides.filter(
    guide => guide.parent_reference_guide_key === null
  );
  const navCategories = topLevelGuides
    .sort((a, b) => a.position - b.position)
    .map(guide => {
      const children = organizeReferenceGuides(referenceGuides, guide.key, 1);
      return {
        key: guide.key,
        name: guide.display_name,
        items: children,
      };
    });
  return (
    <>
      <h1>{referenceGuide.display_name}</h1>
      <div className="page-content">
        <NavigationBar initialCategoryKey={rootCategory.key}>
          {navCategories.map(category => (
            <NavigationCategory
              key={category.key}
              name={category.name}
              initialIsOpen={category.key === rootCategory.key}
            >
              {category.items.map(guide => (
                <NavigationItem
                  key={guide.key}
                  text={guide.display_name}
                  indentLevel={guide.level}
                  href={`${baseUrl}/${guide.key}`}
                  isActive={guide.key === referenceGuide.key}
                />
              ))}
            </NavigationCategory>
          ))}
        </NavigationBar>
        <ReferenceGuide referenceGuide={referenceGuide} />
      </div>
    </>
  );
}

ReferenceGuideView.propTypes = {
  referenceGuide: referenceGuideShape.isRequired,
  referenceGuides: PropTypes.arrayOf(referenceGuideShape).isRequired,
  baseUrl: PropTypes.string.isRequired,
};
