import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import moduleStyles from './sections-refresh.module.scss';
import QuickAssignTable from './QuickAssignTable';
import QuickAssignTableHocPl from './QuickAssignTableHocPl';
import CurriculumQuickAssignTopRow from './CurriculumQuickAssignTopRow';
import VersionUnitDropdowns from './VersionUnitDropdowns';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  CourseOfferingCurriculumTypes as curriculumTypes,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';

export const MARKETING_AUDIENCE = {
  ELEMENTARY: 'elementary',
  MIDDLE: 'middle',
  HIGH: 'high',
  HOC: 'hoc',
  PL: 'pl',
};

export default function CurriculumQuickAssign({
  isNewSection,
  updateSection,
  sectionCourse,
  initialParticipantType,
}) {
  const [courseOfferings, setCourseOfferings] = useState(null);
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
    if (!courseOfferings) return;
    if (!isNewSection) {
      //  TO DO: refactor for efficiency.  Consider using a flatten-like function (maybe in a helper file?)
      const highData = {
        ...courseOfferings[MARKETING_AUDIENCE.HIGH][curriculumTypes.course],
        ...courseOfferings[MARKETING_AUDIENCE.HIGH][
          curriculumTypes.standalone_unit
        ],
        ...courseOfferings[MARKETING_AUDIENCE.HIGH][curriculumTypes.module],
      };
      const middleData = {
        ...courseOfferings[MARKETING_AUDIENCE.MIDDLE][curriculumTypes.course],
        ...courseOfferings[MARKETING_AUDIENCE.MIDDLE][
          curriculumTypes.standalone_unit
        ],
        ...courseOfferings[MARKETING_AUDIENCE.MIDDLE][curriculumTypes.module],
      };
      const elementaryData = {
        ...courseOfferings[MARKETING_AUDIENCE.ELEMENTARY][
          curriculumTypes.course
        ],
        ...courseOfferings[MARKETING_AUDIENCE.ELEMENTARY][
          curriculumTypes.module
        ],
      };
      const hocData = {...courseOfferings[MARKETING_AUDIENCE.HOC]};
      const plData = {...courseOfferings[MARKETING_AUDIENCE.PL]};

      const determineSelectedCourseOffering = (startingData, audience) => {
        const headers = Object.keys(startingData);

        headers.forEach(header => {
          const courseDataByHeaderValues = Object.values(startingData[header]);
          courseDataByHeaderValues.forEach(course => {
            if (sectionCourse?.courseOfferingId === course.id) {
              setSelectedCourseOffering(course);
              updateSectionCourseForExistingSections(course);
              setMarketingAudience(audience);
            }
          });
        });
      };

      if (!selectedCourseOffering) {
        determineSelectedCourseOffering(highData, MARKETING_AUDIENCE.HIGH);
        determineSelectedCourseOffering(middleData, MARKETING_AUDIENCE.MIDDLE);
        determineSelectedCourseOffering(
          elementaryData,
          MARKETING_AUDIENCE.ELEMENTARY
        );
        determineSelectedCourseOffering(hocData, MARKETING_AUDIENCE.HOC);
        determineSelectedCourseOffering(plData, MARKETING_AUDIENCE.PL);
      }
    }
    // added all these dependencies given the eslint warning
  }, [
    courseOfferings,
    isNewSection,
    sectionCourse,
    selectedCourseOffering,
    updateSection,
    updateSectionCourseForExistingSections,
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
        hasLessonExtras: targetUnit?.lesson_extras_available,
        hasTextToSpeech: targetUnit?.text_to_speech_enabled,
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
      {marketingAudience && courseOfferings && (
        <SelectedQuickAssignTable
          marketingAudience={marketingAudience}
          courseOfferings={courseOfferings}
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
};
