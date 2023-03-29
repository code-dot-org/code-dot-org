import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDurations
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import '../../../style/code-studio/curriculum_catalog_card.scss';

// TODO [MEG]: remove this placeholder and require() syntax once images are pulled
const tempImage = require('@cdo/static/resource_cards/anotherhoc.png');

const CurriculumCatalogCard = ({
  courseDisplayName,
  duration,
  youngestGrade,
  oldestGrade,
  imageSrc,
  subjects,
  topics,
  ...props
}) => (
  <CustomizableCurriculumCatalogCard
    assignButtonText={i18n.assign()}
    assignButtonDescription={i18n.assignDescription({
      course_name: props.courseDisplayName
    })}
    courseDisplayName={courseDisplayName}
    duration={translatedCourseOfferingDurations[duration]}
    gradeRange={i18n.gradeRange({
      youngest_grade: youngestGrade,
      oldest_grade: oldestGrade
    })} // TODO [MEG]: Decide on translation strategy for this
    imageSrc={imageSrc}
    subjectsAndTopics={[
      ...subjects.map(
        subject => translatedCourseOfferingSchoolSubjects[subject]
      ),
      ...topics.map(topic => translatedCourseOfferingCsTopics[topic])
    ]}
    quickViewButtonDescription={i18n.quickViewDescription({
      course_name: props.courseDisplayName
    })}
    quickViewButtonText={i18n.quickView()}
  />
);

CurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.oneOf(Object.keys(translatedCourseOfferingDurations))
    .isRequired,
  youngestGrade: PropTypes.number,
  oldestGrade: PropTypes.number,
  imageSrc: PropTypes.string.isRequired,
  subjects: PropTypes.arrayOf(
    PropTypes.oneOf(Object.keys(translatedCourseOfferingSchoolSubjects))
  ).isRequired,
  topics: PropTypes.arrayOf(
    PropTypes.oneOf(Object.keys(translatedCourseOfferingCsTopics))
  ).isRequired
};

CurriculumCatalogCard.defaultProps = {
  imageSrc: tempImage // TODO [MEG]: remove this default once images are pulled
};

const CustomizableCurriculumCatalogCard = ({
  assignButtonDescription,
  assignButtonText,
  courseDisplayName,
  duration,
  gradeRange,
  imageAltText,
  imageSrc,
  subjectsAndTopics,
  quickViewButtonDescription,
  quickViewButtonText
}) => (
  <div className="curriculumCatalogCardContainer">
    <img src={imageSrc} alt={imageAltText} />
    <div className="curriculumInfoContainer">
      {/*TODO [MEG]: Show all subjects and topics rather than only the first one */}
      <p className="overline">{subjectsAndTopics[0]}</p>
      <h4>{courseDisplayName}</h4>
      <div className={'iconWithDescription'}>
        <FontAwesome icon={'user'} className={'fa-solid'} />
        <p className={'iconDescription'}>{gradeRange}</p>
      </div>
      <div className={'iconWithDescription'}>
        {/*TODO [MEG]: Update this to be clock fa-solid when we update FontAwesome */}
        <FontAwesome icon={'clock-o'} />
        <p className={'iconDescription'}>{duration}</p>
      </div>
      <div className="buttonsContainer">
        {/* each button should be same fixed size */}
        <Button
          color={Button.ButtonColor.neutralDark}
          type="button"
          onClick={() => {}}
          aria-label={quickViewButtonDescription}
        >
          {quickViewButtonText}
        </Button>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          type="button"
          onClick={() => {}}
          aria-label={assignButtonDescription}
        >
          {assignButtonText}
        </Button>
      </div>
    </div>
  </div>
);

CustomizableCurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  gradeRange: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string).isRequired,
  quickViewButtonText: PropTypes.string.isRequired,
  assignButtonText: PropTypes.string.isRequired,

  // for screenreaders
  imageAltText: PropTypes.string,
  quickViewButtonDescription: PropTypes.string.isRequired,
  assignButtonDescription: PropTypes.string.isRequired
};

CustomizableCurriculumCatalogCard.defaultProps = {
  imageAltText: '' // for decorative images
};

export default CurriculumCatalogCard;
