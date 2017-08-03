import { PropTypes } from 'react';
import i18n from '@cdo/locale';

// We want level builders to be able to specify which of these strings is used,
// but then want to make sure to show tachers the localized version
const ResourceType = {
  curriculum: 'curriculum',
  teacherForum: 'teacherForum',
  professionalLearning: 'professionalLearning',
};
export default ResourceType;

export const stringForType = {
  [ResourceType.curriculum]: i18n.curriculum(),
  [ResourceType.teacherForum]: i18n.teacherForum(),
  [ResourceType.professionalLearning]: i18n.professionalLearning(),
};

export const resourceShape = PropTypes.shape({
  type: PropTypes.oneOf(Object.values(ResourceType)).isRequired,
  link: PropTypes.string.isRequired,
});
