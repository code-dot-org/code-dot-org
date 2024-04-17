import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import style from './congrats.module.scss';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {CreateSectionsToAssignSectionsDialog} from '@cdo/apps/templates/curriculumCatalog/noSectionsToAssignDialogs';
import {
  assignToSection,
  sectionsForDropdown,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

function SuggestedAssignableCourses({
  assignableCourseSuggestions,
  sectionsForDropdown,
  assignToSection,
  unassignSection,
}) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [courseIdToAssign, setCourseIdToAssign] = useState(null);
  const onAssign = courseId => {
    setIsAssignDialogOpen(true);
    setCourseIdToAssign(courseId);
  };

  const renderAssignDialog = () => {
    if (sectionsForDropdown.length > 0) {
      const courseToAssign = assignableCourseSuggestions.find(
        course => course.course_id === courseIdToAssign
      );
      console.log('courseToAssign', courseToAssign);
      return (
        <MultipleSectionsAssigner
          assignmentName={courseToAssign.display_name_with_latest_year}
          onClose={() => setIsAssignDialogOpen(false)}
          sections={sectionsForDropdown}
          participantAudience="student"
          onAssignSuccess={() => {
            console.log('onAssignSuccess');
            //setIsAssignDialogOpen(false);
          }}
          isAssigningCourse={!!courseIdToAssign}
          courseId={courseIdToAssign}
          sectionDirections={i18n.chooseSectionsDirectionsOnCatalog()}
          assignToSection={assignToSection}
          unassignSection={unassignSection}
        />
      );
    } else {
      return (
        <CreateSectionsToAssignSectionsDialog
          onClose={() => setIsAssignDialogOpen(false)}
          onClick={() => {}}
        />
      );
    }
  };

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
        customRenderAssignDialog={onAssign}
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
      {isAssignDialogOpen && renderAssignDialog()}
    </div>
  );
}

SuggestedAssignableCourses.propTypes = {
  assignableCourseSuggestions: PropTypes.array.isRequired,
  sectionsForDropdown: PropTypes.array.isRequired,
  assignToSection: PropTypes.func.isRequired,
  unassignSection: PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps) => ({
    sectionsForDropdown: sectionsForDropdown(
      state.teacherSections,
      ownProps.courseOfferingId,
      ownProps.courseVersionId,
      state.progress?.scriptId
    ),
  }),
  {
    assignToSection,
    unassignSection,
  }
)(SuggestedAssignableCourses);
