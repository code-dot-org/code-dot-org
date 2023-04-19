import React from 'react';
import moduleStyles from './sections-refresh.module.scss';

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
    <tr key={header}>
      <td className={moduleStyles.courseHeaders}>
        {header}
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
  // useEffect(() => {
  //   const courseValues = Object.values(courseData);

  //   courseValues.map(course =>
  //     sectionCourse?.courseOfferingId === course.id
  //       ? setSelectedCourseOffering(course)
  //       : null
  //   );
  // }, []);

  const courseValues = Object.values(courseData);

  return courseValues.map(course => (
    <div className={moduleStyles.flexDisplay} key={course.display_name}>
      <input
        id={course.display_name}
        className={moduleStyles.radio}
        type="radio"
        name={course.display_name}
        value={course.display_name}
        checked={sectionCourse?.courseOfferingId === course.id}
        onChange={() => {
          updateSectionCourse(updateCourse, course);
          setSelectedCourseOffering(course);
        }}
      />
      <label className={moduleStyles.label} htmlFor={course.display_name}>
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
  updateCourse({
    displayName: course.display_name,
    courseOfferingId: course.id,
    versionId: courseVersionId,
    unitId: null
  });

  // Determine if it is a stand alone unit
  const courseVersion = courseVersions[courseVersionId];
  const isStandaloneUnit = Object.keys(courseVersion.units).length < 2;

  // if so, update the values for LessonExtras and TTS
  if (isStandaloneUnit) {
    const hasLessonExtras = Object.values(courseVersion.units)[0]
      .lesson_extras_available;
    const hasTextToSpeech = Object.values(courseVersion.units)[0]
      .text_to_speech_enabled;
    updateCourse({
      displayName: course.display_name,
      courseOfferingId: course.id,
      versionId: courseVersionId,
      unitId: null,
      hasLessonExtras: hasLessonExtras,
      hasTextToSpeech: hasTextToSpeech
    });
  }
}
