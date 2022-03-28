import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import NavigationBar from './NavigationBar';
import color from '@cdo/apps/util/color';
import {TextLink} from '@dsco_/link';

const baseUrl = window.location.href
  .split('/')
  .slice(0, -1)
  .join('/');

// the contents of each top level nav bar category
// eslint-disable-next-line react/prop-types
const NestedGuideList = ({referenceGuide, referenceGuides}) => {
  const children = referenceGuides.filter(
    guide => guide.parent_reference_guide_key === referenceGuide.key
  );
  return (
    <div style={{paddingLeft: `6px`, borderBottom: '1px solid grey'}}>
      <TextLink
        className="nested-link"
        href={`${baseUrl}/${referenceGuide.key}`}
        text={referenceGuide.display_name}
      />
      {children &&
        children.length > 0 &&
        children.map(guide => (
          <NestedGuideList
            key={guide.key}
            referenceGuide={guide}
            referenceGuides={referenceGuides}
          />
        ))}
    </div>
  );
};

export default function ReferenceGuideView({referenceGuide, referenceGuides}) {
  let rootCategory = referenceGuide;
  while (rootCategory.parent_reference_guide_key !== null) {
    rootCategory = referenceGuides.find(
      guide => guide.key === rootCategory.parent_reference_guide_key
    );
  }
  const topLevelGuides = referenceGuides.filter(
    guide => guide.parent_reference_guide_key === 'concepts'
  );
  const navCategories = topLevelGuides
    .sort((a, b) => a.position - b.position)
    .map(guide => ({
      key: guide.key,
      name: guide.display_name,
      content: (
        <div className="nested-content">
          <NestedGuideList
            referenceGuide={guide}
            referenceGuides={referenceGuides}
          />
        </div>
      ),
      color: color.teal
    }));
  return (
    <>
      <h1>{referenceGuide.display_name}</h1>
      <div className="page-content">
        <NavigationBar
          items={navCategories}
          initialCategoryKey={rootCategory.key}
        />
        <EnhancedSafeMarkdown markdown={referenceGuide.content} />
      </div>
    </>
  );
}

const referenceGuideShape = PropTypes.shape({
  display_name: PropTypes.string,
  content: PropTypes.string,
  position: PropTypes.number,
  parent_reference_guide_key: PropTypes.string
});

ReferenceGuideView.propTypes = {
  referenceGuide: referenceGuideShape.isRequired,
  referenceGuides: PropTypes.arrayOf(referenceGuideShape).isRequired
};
