import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import NavigationBar from './NavigationBar';
import color from '@cdo/apps/util/color';
import {Link} from '@dsco_/link';
import {organizeReferenceGuides} from '@cdo/apps/util/referenceGuideHelpers';

const baseUrl = window.location.href
  .split('/')
  .slice(0, -1)
  .join('/');

const referenceGuideShape = PropTypes.shape({
  display_name: PropTypes.string,
  content: PropTypes.string,
  position: PropTypes.number,
  parent_reference_guide_key: PropTypes.string
});

// the contents of each top level nav bar category
const NestedGuideList = ({referenceGuide, referenceGuides}) => {
  const children = referenceGuides.filter(
    guide => guide.parent_reference_guide_key === referenceGuide.key
  );
  return (
    <>
      <div style={{paddingLeft: `${referenceGuide.level * 12}px`}}>
        <Link className="nested-link" href={`${baseUrl}/${referenceGuide.key}`}>
          {referenceGuide.display_name}
        </Link>
      </div>
      {children &&
        children.length > 0 &&
        children.map(guide => (
          <NestedGuideList
            key={guide.key}
            referenceGuide={guide}
            referenceGuides={referenceGuides}
          />
        ))}
    </>
  );
};
NestedGuideList.propTypes = {
  referenceGuide: referenceGuideShape.isRequired,
  referenceGuides: PropTypes.arrayOf(referenceGuideShape).isRequired
};

export default function ReferenceGuideView({referenceGuide, referenceGuides}) {
  const organizedGuides = organizeReferenceGuides(referenceGuides);
  let rootCategory = referenceGuide;
  // TODO(tim): re-organize things to get rid of the concepts guide
  while (rootCategory.parent_reference_guide_key !== 'concepts') {
    rootCategory = organizedGuides.find(
      guide => guide.key === rootCategory.parent_reference_guide_key
    );
  }
  const topLevelGuides = organizedGuides.filter(
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
            referenceGuides={organizedGuides}
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

ReferenceGuideView.propTypes = {
  referenceGuide: referenceGuideShape.isRequired,
  referenceGuides: PropTypes.arrayOf(referenceGuideShape).isRequired
};
