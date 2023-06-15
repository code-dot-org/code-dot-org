import {flatten} from 'lodash';

export const getGuideChildren = (key, guides) =>
  guides
    .filter(guide => guide.parent_reference_guide_key === key)
    .sort((a, b) => a.position - b.position);

// take a list of reference guides and build a tree data structure and then flatten it
export const organizeReferenceGuides = (
  referenceGuides,
  parent = null,
  level = 0
) => {
  const organizedGuides = getGuideChildren(parent, referenceGuides).map(
    guide => [
      {...guide, level}, // add the depth of this guide so we can render the indentation
      ...organizeReferenceGuides(referenceGuides, guide.key, level + 1), // put the children right after the parent
    ]
  );
  return flatten(organizedGuides);
};
