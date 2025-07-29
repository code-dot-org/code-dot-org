import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import {
  gradeLevelsMap,
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingDeviceTypes,
  translatedCourseOfferingDurationsWithTime,
  translatedCourseOfferingMarketingInitiatives,
  translatedGradeLevels,
  translatedInterdisciplinary,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import i18n from '@cdo/locale';

// types.ts

/** Union of filter keys used in the UI and query params */
export type GenericFilterKey =
  | 'grade'
  | 'duration'
  | 'topic'
  | 'device'
  | 'marketingInitiative';

export interface SelfPacedPLCatalogFilter {
  grade: string[];
  duration: string[];
  topic: string[];
  marketingInitiative: string[];
}

/** Shape of all curriculum catalog filters */
export interface CurriculumFilters {
  grade: string[];
  duration: string[];
  topic: string[];
  device: string[];
  marketingInitiative: string[];
  translated: boolean;
}

/** UI config for a single filter dropdown */
export interface FilterTypeConfig {
  name: GenericFilterKey;
  label: string;
  options: {
    [key: string]: string; // raw value -> display string
  };
}

/** All filters available except the "translated" toggle */
export type FilterTypesMap = {
  [key in GenericFilterKey]: FilterTypeConfig;
};

/** Type for filtering callback used in useEffect or parent prop */
export type FilterChangeHandler = (
  curriculaData: CourseOffering[],
  filters: CurriculumFilters
) => CourseOffering[];

export const commonFilterTypes: FilterTypesMap = {
  grade: {
    name: 'grade',
    label: i18n.grade(),
    options: translatedGradeLevels,
  },
  duration: {
    name: 'duration',
    label: i18n.duration(),
    options: translatedCourseOfferingDurationsWithTime,
  },
  topic: {
    name: 'topic',
    label: i18n.topic(),
    options: {
      ...translatedInterdisciplinary,
      ...translatedCourseOfferingCsTopics,
    },
  },
  device: {
    name: 'device',
    label: i18n.device(),
    options: translatedCourseOfferingDeviceTypes,
  },
  marketingInitiative: {
    name: 'marketingInitiative',
    label: i18n.curriculum(),
    options: translatedCourseOfferingMarketingInitiatives,
  },
};

// Returns whether the given curriculum matches the checked grade level filters.
export const filterByGradeLevel = (
  curriculum: CourseOffering,
  gradeFilters: string[]
) => {
  if (gradeFilters.length > 0) {
    if (!curriculum.grade_levels) {
      return false;
    } else {
      const curriculumGradeLevels = curriculum.grade_levels.split(',');
      const supportsFilteredGradeLevel = gradeFilters.some(
        grade =>
          grade in gradeLevelsMap &&
          curriculumGradeLevels.includes(
            gradeLevelsMap[grade as keyof typeof gradeLevelsMap]
          )
      );
      if (!supportsFilteredGradeLevel) {
        return false;
      }
    }
  }
  return true;
};

// Returns whether the given curriculum matches the checked duration filters.
export const filterByDuration = (
  curriculum: CourseOffering,
  durationFilters: string[]
) => {
  return (
    durationFilters.length === 0 ||
    (curriculum.duration && durationFilters.includes(curriculum.duration))
  );
};

// Returns whether the given curriculum matches the checked topic filters.
// (Note: the Interdisciplinary topic will show any course that has been tagged
// with a school subject (e.g. Math, Science, etc.))
export const filterByTopic = (
  curriculum: CourseOffering,
  topicFilters: string[]
) => {
  if (topicFilters.length > 0) {
    if (!curriculum.cs_topic) {
      return false;
    } else {
      // Handle main CS topics
      const curriculumTopics = curriculum.cs_topic.split(',');
      const supportsFilteredTopics = topicFilters.some(topic =>
        curriculumTopics.includes(topic)
      );
      // Handle case of Interdisciplinary topic
      const hasAndSupportsInterdisciplinary =
        topicFilters.includes('interdisciplinary') && curriculum.school_subject;
      if (!supportsFilteredTopics && !hasAndSupportsInterdisciplinary) {
        return false;
      }
    }
  }
  return true;
};

// Returns whether the given curriculum matches the checked device filters.
export const filterByDevice = (
  curriculum: CourseOffering,
  deviceFilters: string[]
) => {
  if (deviceFilters.length > 0) {
    if (!curriculum.device_compatibility) {
      return false;
    } else {
      const curriculumDevComp = JSON.parse(curriculum.device_compatibility);
      const supportsFilteredDevice = deviceFilters.some(
        device => curriculumDevComp[device] === 'ideal'
      );
      if (!supportsFilteredDevice) {
        return false;
      }
    }
  }
  return true;
};

export const filterByMarketingInitiative = (
  curriculum: CourseOffering,
  marketingInitiativeFilters: string[]
) => {
  if (marketingInitiativeFilters.length > 0) {
    if (!curriculum.marketing_initiative) {
      return false;
    } else if (
      marketingInitiativeFilters.includes(
        curriculum.marketing_initiative.toLowerCase()
      )
    ) {
      return true;
    }
    return false;
  }

  return true;
};
