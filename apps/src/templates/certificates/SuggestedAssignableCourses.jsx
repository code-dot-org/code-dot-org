import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import i18n from '@cdo/locale';

import style from './suggested_assignable_courses.module.scss';
function SuggestedAssignableCourses({assignableCourseSuggestions, isEnglish}) {
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const handleQuickViewClicked = key => {
    if (expandedCardKey === key) {
      setExpandedCardKey(null);
    } else {
      setExpandedCardKey(key);
    }
  };

  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (assignSuccess) {
      timeoutId = setTimeout(() => {
        setAssignSuccess(false);
      }, 7000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [assignSuccess]);

  const assignableCourseComponent = () => {
    if (assignableCourseSuggestions.length === 0) {
      return null;
    }
    if (assignableCourseSuggestions.length === 1) {
      const {
        key,
        image,
        display_name,
        display_name_with_latest_year,
        grade_levels,
        duration,
        school_subject,
        cs_topic,
        course_version_path,
        course_version_id,
        course_id,
        course_offering_id,
        script_id,
        is_standalone_unit,
        is_translated,
        //Expanded Card Props
        device_compatibility,
        description,
        professional_learning_program,
        video,
        published_date,
        self_paced_pl_course_offering_path,
        available_resources,
      } = assignableCourseSuggestions[0];
      return (
        <CurriculumCatalogCard
          key={key}
          courseKey={key}
          courseDisplayName={display_name}
          courseDisplayNameWithLatestYear={display_name_with_latest_year}
          imageSrc={image || undefined}
          duration={duration}
          gradesArray={grade_levels.split(',')}
          subjects={school_subject?.split(',')}
          topics={cs_topic?.split(',')}
          isTranslated={is_translated}
          isEnglish={isEnglish}
          pathToCourse={course_version_path}
          courseVersionId={course_version_id}
          courseId={course_id}
          courseOfferingId={course_offering_id}
          scriptId={script_id}
          isStandAloneUnit={is_standalone_unit}
          onAssignSuccess={() => setAssignSuccess(true)}
          deviceCompatibility={device_compatibility}
          description={description}
          professionalLearningProgram={professional_learning_program}
          video={video}
          publishedDate={published_date}
          selfPacedPlCourseOfferingPath={self_paced_pl_course_offering_path}
          isExpanded={expandedCardKey === key}
          handleSetExpandedCardKey={() =>
            setExpandedCardKey(expandedCardKey === key ? null : key)
          }
          onQuickViewClick={() => handleQuickViewClicked(key)}
          availableResources={available_resources}
          isSignedOut={false}
          isTeacher
          wide
        />
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      {assignableCourseComponent()}
      {assignSuccess && (
        <Alert
          text={i18n.assignSuccess()}
          type="success"
          size="m"
          className={style.assignSuccessAlert}
        />
      )}
    </div>
  );
}

SuggestedAssignableCourses.propTypes = {
  assignableCourseSuggestions: PropTypes.array.isRequired,
  isEnglish: PropTypes.bool,
};

export default SuggestedAssignableCourses;
