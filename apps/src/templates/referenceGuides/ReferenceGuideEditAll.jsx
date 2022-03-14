import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {flatten} from 'lodash';

const MiniIconButton = ({icon, alt, func, href}) =>
  func ? (
    <button onClick={func} type="button">
      <FontAwesome icon={icon} title={alt} />
    </button>
  ) : (
    <TextLink href={href} icon={<FontAwesome icon={icon} title={alt} />} />
  );
MiniIconButton.propTypes = {
  icon: FontAwesome.propTypes.icon,
  alt: PropTypes.string,
  func: PropTypes.func,
  href: PropTypes.string
};

const getGuideChildren = (key, guides) =>
  guides
    .filter(guide => guide.parent_reference_guide_key === key)
    .sort((a, b) => a.position - b.position);

// take a list of reference guides and build a tree data structure and then flatten it
const organizeReferenceGuides = (referenceGuides, parent = null, level = 0) => {
  const organizedGuides = getGuideChildren(parent, referenceGuides).map(
    guide => [
      {...guide, level}, // add the depth of this guide so we can render the indentation
      ...organizeReferenceGuides(referenceGuides, guide.key, level + 1) // put the children right after the parent
    ]
  );
  return flatten(organizedGuides);
};

export default function ReferenceGuideEditAll({referenceGuides}) {
  // useMemo here so that we only do the organizing once
  const organizedGuides = useMemo(
    () => organizeReferenceGuides(referenceGuides),
    [referenceGuides]
  );
  return (
    <div>
      <h1>Reference Guides</h1>
      <div className="page-actions">
        <TextLink
          className="create-btn"
          icon={<FontAwesome icon="plus" />}
          iconBefore={true}
          text="Create New Guide"
        />
      </div>

      <div className="guides-table">
        <span className="header">Actions</span>
        <span className="header">Reference Guides</span>
        {organizedGuides.map(guide => {
          return [
            <div key={`${guide.key}-actions`} className="actions-box">
              <MiniIconButton icon="pencil-square-o" alt="edit" />
              <MiniIconButton icon="trash" alt="delete" />
              <MiniIconButton icon="caret-up" alt="move guide up" />
              <MiniIconButton icon="caret-down" alt="move guide down" />
            </div>,
            <div
              key={`${guide.key}-guide`}
              className="guide-box"
              style={{paddingLeft: `${guide.level * 20 + 4}px`}}
            >
              {guide.display_name}
            </div>
          ];
        })}
      </div>
    </div>
  );
}

const referenceGuideShape = PropTypes.shape({
  key: PropTypes.string,
  parent_reference_guide_key: PropTypes.string,
  display_name: PropTypes.string,
  position: PropTypes.number
});

ReferenceGuideEditAll.propTypes = {
  referenceGuides: PropTypes.arrayOf(referenceGuideShape).isRequired
};
