import React from 'react';
import classnames from 'classnames';
import moduleStyles from './sections-refresh.module.scss';
import {Heading5} from '@cdo/apps/componentLibrary/typography';

/*
This is a file to house the shared pieces of both types of Curriculum
QuickAssign tables, so that the GradeBand and Hoc/Pl tables don't repeat code.
*/

/*
  Responsible for rendering the category headers and calling the next
  function to render the course offerings. This 'key=' uses the header as
  a unique identifier.
*/
export function renderRows(
  courseData,
  sectionCourse,
  updateCourse,
  setSelectedCourseOffering
) {
  const headers = Object.keys(courseData);
  return headers.map(header => (
    <tr key={header} className={moduleStyles.courseTableRow}>
      <td className={moduleStyles.courseHeaders}>
        <Heading5>{header}</Heading5>
        {renderOfferings(
          courseData[header],
          sectionCourse,
          updateCourse,
          setSelectedCourseOffering
        )}
      </td>
    </tr>
  ));
}

/*
  Renders all the radio type inputs within each table. Only one can be
  selected at a time. Selecting one immediately calls updateCourse.
*/
function renderOfferings(
  courseData,
  sectionCourse,
  updateCourse,
  setSelectedCourseOffering
) {
  const courseValues = Object.values(courseData);

  return courseValues.map(course => (
    <div
      className={classnames(
        moduleStyles.flexDisplay,
        moduleStyles.courseOption
      )}
      key={course.display_name}
    >
      <input
        id={course.display_name}
        className={classnames(
          moduleStyles.radio,
          moduleStyles.withBrandAccentColor
        )}
        type="radio"
        name={course.display_name}
        value={course.display_name}
        checked={sectionCourse?.courseOfferingId === course.id}
        onChange={() => {
          updateSectionCourse(updateCourse, course);
          setSelectedCourseOffering(course);
        }}
      />
      <label
        className={moduleStyles.courseOptionLabel}
        htmlFor={course.display_name}
      >
        {course.display_name}
      </label>
    </div>
  ));
}

function updateSectionCourse(updateCourse, course) {
  let courseVersionId;
  const courseVersions = {};
  // The structure of cv is an array with the first item an id and the second
  // item an object of everything. See 'CourseOfferingsTestData' for examples
  course.course_versions.map(cv => {
    courseVersions[cv[1].id] = cv[1];
  });
  if (Object.keys(courseVersions).length === 1) {
    courseVersionId = Object.values(courseVersions)[0].id;
  } else {
    courseVersionId = Object.values(courseVersions)?.find(
      versions => versions.is_recommended
    )?.id;
  }

  // If no recommended version, fall back to the most recent stable version.
  if (courseVersionId === undefined) {
    const stableVersions = Object.values(courseVersions)
      .filter(version => version.is_stable)
      .sort((a, b) => b.key - a.key);
    courseVersionId = stableVersions[0]?.id;
  }

  const courseVersion = courseVersions[courseVersionId];
  const isStandaloneUnit = courseVersion.type === 'Unit';

  let hasLessonExtras;
  let hasTextToSpeech;

  if (isStandaloneUnit) {
    hasLessonExtras = Object.values(courseVersion.units)[0]
      .lesson_extras_available;
    hasTextToSpeech = Object.values(courseVersion.units)[0]
      .text_to_speech_enabled;
  }

  updateCourse({
    displayName: course.display_name,
    courseOfferingId: course.id,
    versionId: courseVersionId,
    unitId: null,
    hasLessonExtras: hasLessonExtras,
    hasTextToSpeech: hasTextToSpeech,
  });
}
