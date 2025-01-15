import classnames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import {
  CourseOfferingCurriculumTypes as curriculumTypes,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import i18n from '@cdo/locale';

import CurriculumQuickAssignTopRow from './CurriculumQuickAssignTopRow';
import QuickAssignTable from './QuickAssignTable';
import QuickAssignTableHocPl from './QuickAssignTableHocPl';
import VersionUnitDropdowns from './VersionUnitDropdowns';

import moduleStyles from './sections-refresh.module.scss';

export const MARKETING_AUDIENCE = {
  ELEMENTARY: 'elementary',
  MIDDLE: 'middle',
  HIGH: 'high',
  HOC: 'hoc',
  PL: 'pl',
};
const CURRICULUM_TYPES_FOR_AUDIENCE = {
  // [MARKETING_AUDIENCE.HIGH]: [
  //   curriculumTypes.course,
  //   curriculumTypes.standalone_unit,
  //   curriculumTypes.module,
  // ],
  // [MARKETING_AUDIENCE.MIDDLE]: [
  //   curriculumTypes.course,
  //   curriculumTypes.standalone_unit,
  //   curriculumTypes.module,
  // ],
  [MARKETING_AUDIENCE.ELEMENTARY]: [
    curriculumTypes.course,
    curriculumTypes.module,
  ],
  // [MARKETING_AUDIENCE.HOC]: null,
  // [MARKETING_AUDIENCE.PL]: null,
};

export default function CurriculumQuickAssign({
  isNewSection,
  updateSection,
  sectionCourse,
  initialParticipantType,
  courseFilters,
}) {
  const [courseOfferings, setCourseOfferings] = useState(null);
  const [filteredCourseOfferings, setFilteredCourseOfferings] = useState(null);
  const [decideLater, setDecideLater] = useState(false);
  const [marketingAudience, setMarketingAudience] = useState('');
  const [selectedCourseOffering, setSelectedCourseOffering] = useState();

  const participantType = isNewSection
    ? queryParams('participantType')
    : initialParticipantType;

  const showPlOfferings = participantType !== ParticipantAudience.student;

  const updateCourse = useCallback(
    course => updateSection('course', course),
    [updateSection]
  );

  // Retrieve course offerings on mount and convert to JSON
  useEffect(() => {
    fetch(
      `/course_offerings/quick_assign_course_offerings?participantType=${participantType}`
    )
      .then(response => response.json())
      .then(data => setCourseOfferings(data));
  }, [participantType]);

  useEffect(() => {
    // Filter the offerings based on the filters provided
    const filterOfferings = data => {
      const languageFilter = courseFilters?.language;

      if (languageFilter && data) {
        // Crawl data and remove any courses / versions that are not available
        // in the requested language.
        for (const levelInfo of Object.values(data)) {
          // For each level (elementary, middle, high, hoc, etc), go through the categories
          for (const [categoryKey, categoryInfo] of Object.entries(levelInfo)) {
            // Here, we are listing the category (Course, Module, etc)
            // Now for each course, we go through the versions and filter out only ones
            // matching the requested language (CS Fundamentals, Express, etc)
            if (Array.isArray(categoryInfo)) {
              for (const courseInfo of categoryInfo) {
                // These will be the course info blocks which are a tuple of the id and then metadata.
                courseInfo.course_versions = courseInfo.course_versions.filter(
                  ([_, versionInfo]) =>
                    versionInfo.locale_codes.includes(languageFilter)
                );
              }

              // Truncate any courses within the category that aren't matching our filter
              levelInfo[categoryKey] = categoryInfo.filter(
                courseInfo => courseInfo.course_versions.length > 0
              );
              // Get rid the category if there are no courses under it anymore
              if (levelInfo[categoryKey].length === 0) {
                delete levelInfo[categoryKey];
              }
            } else {
              for (const [key, unitGroupInfo] of Object.entries(categoryInfo)) {
                for (const courseInfo of unitGroupInfo) {
                  // These will be the course info blocks which are a tuple of the id and then metadata.
                  courseInfo.course_versions =
                    courseInfo.course_versions.filter(([_, versionInfo]) =>
                      versionInfo.locale_codes.includes(languageFilter)
                    );
                }

                // Truncate any courses within the unit that aren't matching our filter
                categoryInfo[key] = unitGroupInfo.filter(
                  courseInfo => courseInfo.course_versions.length > 0
                );
                // Get rid of the whole unit group if it has no courses
                if (categoryInfo[key].length === 0) {
                  delete categoryInfo[key];
                }
              }
            }
          }
        }
      }

      return data;
    };

    setFilteredCourseOfferings(filterOfferings(courseOfferings));
  }, [courseOfferings, courseFilters?.language]);

  const getSelectedCourseOffering = useCallback(() => {
    const selectedSectionFromGroup = courseGroup => {
      return _.find(
        courseGroup,
        course => sectionCourse?.courseOfferingId === course.id
      );
    };

    const selectedSectionFromCurriculumType = (audience, curriculumType) => {
      if (!filteredCourseOfferings[audience][curriculumType]) {
        return null;
      }

      for (const courseGroup of Object.values(
        filteredCourseOfferings[audience][curriculumType]
      )) {
        const course = selectedSectionFromGroup(courseGroup);

        console.log('lfm 3', course);
        if (course) {
          console.log('lfm 4', course);
          return course;
        }
      }
      return null;
    };

    const selectedSectionFromAudience = audience => {
      const curriculumTypes = CURRICULUM_TYPES_FOR_AUDIENCE[audience];

      if (!curriculumTypes) {
        const course = selectedSectionFromGroup(
          filteredCourseOfferings[audience]
        );
        return course ? {course, audience} : null;
      }
      for (const curriculumType of curriculumTypes) {
        const course = selectedSectionFromCurriculumType(
          audience,
          curriculumType
        );
        console.log('lfm 2', course);
        if (course) {
          console.log('lfm 1', course);
          return {course, audience};
        }
      }

      return null;
    };

    for (const audience of Object.keys(filteredCourseOfferings)) {
      const result = selectedSectionFromAudience(audience);
      if (result) {
        return result;
      }
    }

    return null;
  }, [filteredCourseOfferings, sectionCourse]);

  useEffect(() => {
    if (!filteredCourseOfferings) return;
    if (!isNewSection) {
      const determineSelectedCourseOffering = () => {
        const selection = getSelectedCourseOffering(filteredCourseOfferings);

        console.log('lfm 0', selection);
        if (selection) {
          setSelectedCourseOffering(selection.course);
          updateSectionCourseForExistingSections(selection.course);
          setMarketingAudience(selection.audience);
          return;
        }
      };

      if (!selectedCourseOffering) {
        determineSelectedCourseOffering(filteredCourseOfferings);
      }
    }
    // added all these dependencies given the eslint warning
  }, [
    filteredCourseOfferings,
    isNewSection,
    sectionCourse,
    selectedCourseOffering,
    updateSection,
    updateSectionCourseForExistingSections,
    getSelectedCourseOffering,
  ]);

  const updateSectionCourseForExistingSections = useCallback(
    course => {
      const courseVersions = {};
      // The structure of cv is an array with the first item an id and the second
      // item an object of everything. See 'CourseOfferingsTestData' for examples
      course.course_versions.map(cv => {
        courseVersions[cv[1].id] = cv[1];
      });

      const courseVersionId = sectionCourse.versionId;
      const courseVersion = courseVersions[courseVersionId];
      const isStandaloneUnit = courseVersion.type === 'Unit';

      let targetUnit;

      if (isStandaloneUnit) {
        targetUnit = Object.values(courseVersion.units)[0];
      } else if (sectionCourse.unitId) {
        targetUnit = courseVersion.units[sectionCourse.unitId];
      }

      const updateSectionData = {
        displayName: course.display_name,
        courseOfferingId: course.id,
        versionId: courseVersionId,
        unitId: isStandaloneUnit ? null : sectionCourse.unitId,
        lessonExtrasAvailable: targetUnit?.lesson_extras_available,
        textToSpeechEnabled: targetUnit?.text_to_speech_enabled,
      };

      updateCourse(updateSectionData);
    },
    [updateCourse, sectionCourse]
  );

  /*
    When toggling 'decide later', erase any selected course assignment.
    Leave the marketing audience alone to prevent toggling of the table that
    might be jarring to the user.
  */
  const toggleDecideLater = () => {
    // User clicked "Clear assigned curriculum"
    if (selectedCourseOffering) {
      setDecideLater(false);
    }

    // User clicked "Decide later"
    else {
      setDecideLater(!decideLater);
    }

    updateCourse({});
    setSelectedCourseOffering(null);
  };

  // To distinguish between types of tables: HOC & PL vs Grade Bands
  const SelectedQuickAssignTable =
    marketingAudience === MARKETING_AUDIENCE.HOC ||
    marketingAudience === MARKETING_AUDIENCE.PL
      ? QuickAssignTableHocPl
      : QuickAssignTable;

  return (
    <div className={moduleStyles.containerWithMarginTop}>
      <div className={moduleStyles.input}>
        <label
          className={classnames(
            moduleStyles.decideLater,
            moduleStyles.typographyLabel
          )}
          htmlFor="decide-later"
        >
          {selectedCourseOffering
            ? i18n.clearAssignedCurriculum()
            : i18n.decideLater()}
        </label>
        <input
          checked={decideLater}
          className={classnames(
            moduleStyles.inputBox,
            moduleStyles.withBrandAccentColor
          )}
          type="checkbox"
          id="decide-later"
          onChange={toggleDecideLater}
        />
        <Heading3>{i18n.assignCurriculum()}</Heading3>
        <BodyTwoText>{i18n.useDropdownMessage()}</BodyTwoText>
      </div>
      <CurriculumQuickAssignTopRow
        showPlOfferings={showPlOfferings}
        marketingAudience={marketingAudience}
        updateMarketingAudience={setMarketingAudience}
      />
      {marketingAudience && filteredCourseOfferings && (
        <SelectedQuickAssignTable
          marketingAudience={marketingAudience}
          courseOfferings={filteredCourseOfferings}
          setSelectedCourseOffering={offering => {
            setDecideLater(false);
            setSelectedCourseOffering(offering);
          }}
          updateCourse={updateCourse}
          sectionCourse={sectionCourse}
          isNewSection={isNewSection}
        />
      )}
      {marketingAudience && (
        <VersionUnitDropdowns
          courseOffering={selectedCourseOffering}
          updateCourse={updateCourse}
          sectionCourse={sectionCourse}
          isNewSection={isNewSection}
        />
      )}
    </div>
  );
}

CurriculumQuickAssign.propTypes = {
  updateSection: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object,
  isNewSection: PropTypes.bool,
  initialParticipantType: PropTypes.string,
  courseFilters: PropTypes.object,
};
