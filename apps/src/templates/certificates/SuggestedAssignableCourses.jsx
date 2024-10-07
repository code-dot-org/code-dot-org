import PropTypes from 'prop-types';
import React, {useState} from 'react';

import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

function SuggestedAssignableCourses({assignableCourseSuggestions, isEnglish}) {
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const handleQuickViewClicked = key => {
    if (expandedCardKey === key) {
      setExpandedCardKey(null);
    } else {
      setExpandedCardKey(key);
    }
  };

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
        onAssignSuccess={() => console.log('onAssignSuccess')}
        deviceCompatibility={device_compatibility}
        description={description}
        professionalLearningProgram={professional_learning_program}
        video={video}
        publishedDate={published_date}
        selfPacedPlCourseOfferingPath={self_paced_pl_course_offering_path}
        isExpanded={expandedCardKey === key}
        handleSetExpandedCardKey={() => console.log('handleSetExpandedCardKey')}
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
}

SuggestedAssignableCourses.propTypes = {
  assignableCourseSuggestions: PropTypes.array.isRequired,
  isEnglish: PropTypes.bool,
};

export default SuggestedAssignableCourses;
