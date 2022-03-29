import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import NavigationBar from './NavigationBar';
import color from '@cdo/apps/util/color';
import {Link} from '@dsco_/link';
import {organizeReferenceGuides} from '@cdo/apps/util/referenceGuideHelpers';
import classNames from 'classnames';

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

const NavBarItem = ({guide, isActive}) => (
  <div
    style={{paddingLeft: `${guide.level * 12}px`}}
    className={classNames({
      'nav-link': true,
      active: isActive
    })}
  >
    <Link className="link" href={`${baseUrl}/${guide.key}`} weight="medium">
      {guide.display_name}
    </Link>
  </div>
);
NavBarItem.propTypes = {
  guide: referenceGuideShape.isRequired,
  isActive: PropTypes.bool
};

export default function ReferenceGuideView({referenceGuide, referenceGuides}) {
  let rootCategory = referenceGuide;
  // TODO(tim): re-organize things to get rid of the concepts guide
  while (rootCategory.parent_reference_guide_key !== 'concepts') {
    rootCategory = referenceGuides.find(
      guide => guide.key === rootCategory.parent_reference_guide_key
    );
  }
  const topLevelGuides = referenceGuides.filter(
    guide => guide.parent_reference_guide_key === 'concepts'
  );
  const navCategories = topLevelGuides
    .sort((a, b) => a.position - b.position)
    .map(guide => {
      const children = organizeReferenceGuides(referenceGuides, guide.key, 1);
      return {
        key: guide.key,
        name: guide.display_name,
        content: (
          <>
            {children.map(guide => (
              <NavBarItem
                key={guide.key}
                guide={guide}
                isActive={guide.key === referenceGuide.key}
              />
            ))}
          </>
        ),
        color: color.teal
      };
    });
  return (
    <>
      <h1>{referenceGuide.display_name}</h1>
      <div className="page-content">
        <NavigationBar
          categories={navCategories}
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
