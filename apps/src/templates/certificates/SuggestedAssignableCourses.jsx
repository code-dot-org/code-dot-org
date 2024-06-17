import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';

import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

import style from './congrats.module.scss';

function SuggestedAssignableCourses({assignableCourseSuggestions}) {
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
        //isEnglish={isEnglish}
        pathToCourse={course_version_path}
        courseVersionId={course_version_id}
        courseId={course_id}
        courseOfferingId={course_offering_id}
        scriptId={script_id}
        isStandAloneUnit={is_standalone_unit}
        //onAssignSuccess={response => handleAssignSuccess(response)}
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
        //onQuickViewClick={() => console.log('onQuickViewClick')}
        //isInUS={isInUS}
        availableResources={available_resources}
        isSignedOut={false}
        isTeacher
        wide
      />
    );
  } else {
    return (
      <SuggestedAssignableCoursesCarousel
        assignableCourseSuggestions={assignableCourseSuggestions}
      />
    );
  }
}

SuggestedAssignableCourses.propTypes = {
  assignableCourseSuggestions: PropTypes.array.isRequired,
};

function SuggestedAssignableCoursesCarousel({assignableCourseSuggestions}) {
  const renderCurriculumCard = suggestedCurriculum => {
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
    } = suggestedCurriculum;
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
        //isEnglish={isEnglish}
        pathToCourse={course_version_path}
        courseVersionId={course_version_id}
        courseId={course_id}
        courseOfferingId={course_offering_id}
        scriptId={script_id}
        isStandAloneUnit={is_standalone_unit}
        //onAssignSuccess={response => handleAssignSuccess(response)}
        onAssignSuccess={() => console.log('onAssignSuccess')}
        deviceCompatibility={device_compatibility}
        description={description}
        professionalLearningProgram={professional_learning_program}
        video={video}
        publishedDate={published_date}
        selfPacedPlCourseOfferingPath={self_paced_pl_course_offering_path}
        // isExpanded={expandedCardKey === key}
        handleSetExpandedCardKey={() => console.log('handleSetExpandedCardKey')}
        //onQuickViewClick={() => handleQuickViewClicked(key)}
        //onQuickViewClick={() => console.log('onQuickViewClick')}
        //isInUS={isInUS}
        availableResources={available_resources}
        isSignedOut={false}
        isTeacher
      />
    );
  };

  const swiperRef = useRef(null);
  useEffect(() => {
    if (swiperRef.current) {
      const swiperParams = {
        autoHeight: true,
        pagination: {
          clickable: true,
        },
        navigation: true,
        spaceBetween: 14,
        slidesPerView: 3,
        slidesPerGroup: 3,
        breakpoints: {
          640: {
            autoHeight: false,
          },
        },
        injectStyles: [
          `
          :host .swiper-pagination {
            position: relative;
            margin-top: 2rem;
            .swiper-pagination-bullet {
              margin-block: 0.5rem;
            }
          }
          `,
        ],
      };
      Object.assign(swiperRef.current, swiperParams);
      swiperRef.current.initialize();
    }
  }, []);

  return (
    <div className={style.courseAssignCarouselWrapper}>
      <swiper-container
        init="false"
        ref={swiperRef}
        className={style.swiperContainer}
        navigation-next-el="#assignable-course-swiper-nav-next"
        navigation-prev-el="#assignable-course-swiper-nav-prev"
      >
        {assignableCourseSuggestions.map(course => (
          <swiper-slide key={course.key}>
            {renderCurriculumCard(course)}
          </swiper-slide>
        ))}
      </swiper-container>
      <button
        id="assignable-course-swiper-nav-prev"
        className={classNames(style.navButton, style.prevElNav)}
        type="button"
      />
      <button
        id="assignable-course-swiper-nav-next"
        className={classNames(style.navButton, style.nextElNav)}
        type="button"
      />
    </div>
  );
}

SuggestedAssignableCoursesCarousel.propTypes = {
  assignableCourseSuggestions: PropTypes.array.isRequired,
};

export default SuggestedAssignableCourses;
