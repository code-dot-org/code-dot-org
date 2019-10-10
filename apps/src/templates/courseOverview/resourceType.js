import PropTypes from 'prop-types';
import i18n from '@cdo/locale';

// We want level builders to be able to specify which of these strings is used,
// but then want to make sure to show teachers the localized version
const ResourceType = {
  curriculum: 'curriculum',
  teacherForum: 'teacherForum',
  professionalLearning: 'professionalLearning',
  lessonPlans: 'lessonPlans',
  vocabulary: 'vocabulary',
  codeIntroduced: 'codeIntroduced',
  standardMappings: 'standardMappings',
  allHandouts: 'allHandouts',
  videos: 'videos',
  curriculumGuide: 'curriculumGuide'
};
export default ResourceType;

export const stringForType = {
  [ResourceType.curriculum]: i18n.curriculum(),
  [ResourceType.teacherForum]: i18n.teacherForum(),
  [ResourceType.professionalLearning]: i18n.professionalLearning(),
  [ResourceType.lessonPlans]: i18n.lessonPlans(),
  [ResourceType.vocabulary]: i18n.vocabulary(),
  [ResourceType.codeIntroduced]: i18n.codeIntroduced(),
  [ResourceType.standardMappings]: i18n.standardMappings(),
  [ResourceType.allHandouts]: i18n.allHandouts(),
  [ResourceType.videos]: i18n.videos(),
  [ResourceType.curriculumGuide]: i18n.curriculumGuide()
};

export const resourceShape = PropTypes.shape({
  type: PropTypes.oneOf(Object.values(ResourceType)).isRequired,
  link: PropTypes.string.isRequired
});
