import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';

import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

import style from './congrats.module.scss';

function SuggestedAssignableCourses({assignableCourseSuggestions}) {
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
        onQuickViewClick={() => console.log('onQuickViewClick')}
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
        autoHeight: false,
        pagination: {
          clickable: true,
        },
        spaceBetween: 14,
        slidesPerView: 3,
        slidesPerGroup: 3,
        breakpoints: {
          640: {
            autoHeight: false,
          },
        },
        preventClicksPropagation: false,
        preventClicks: false,
        injectStyles: [
          `
            :host .swiper-pagination {
              position: relative;
              margin-top: 2rem;
            }
            `,
        ],
      };
      Object.assign(swiperRef.current, swiperParams);
      swiperRef.current.initialize();

      /*swiperRef.current.addEventListener('swiperslidechange', e => {
        const [swiper] = e.detail;
        setCurrentImageIndex(swiper.activeIndex);
      });*/
    }
  }, []);

  return (
    <div>
      <swiper-container ref={swiperRef} class={style.swiperContainer}>
        {assignableCourseSuggestions.map(course => (
          <swiper-slide key={course.key} class={style.swiperSlide}>
            {renderCurriculumCard(course)}
          </swiper-slide>
        ))}
      </swiper-container>
    </div>
  );
}

SuggestedAssignableCourses.propTypes = {
  assignableCourseSuggestions: PropTypes.array.isRequired,
  sectionsForDropdown: PropTypes.array.isRequired,
  assignToSection: PropTypes.func.isRequired,
  unassignSection: PropTypes.func.isRequired,
};

export default SuggestedAssignableCourses;
