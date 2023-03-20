import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import {cardImageNamesToSrc} from '@cdo/apps/templates/curriculumCatalog/cardImageNamesToSrc';
import '../../../style/code-studio/curriculum_catalog_card.scss';

const CurriculumCatalogCard = ({
  assignButtonDescription,
  courseName,
  duration,
  gradeOrAgeRange,
  imageAltText,
  imageName,
  topic,
  quickViewButtonDescription
}) => (
  <div className="curriculumCatalogCardContainer">
    <img src={cardImageNamesToSrc[imageName]} alt={imageAltText} />
    <div className="curriculumInfoContainer">
      <p className="overline">{topic}</p>
      <h4>{courseName}</h4>
      <div className={'iconWithDescription'}>
        <FontAwesome icon={'user'} className={'fa-solid'} />
        <p className={'iconDescription'}>{gradeOrAgeRange}</p>
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
          Quick View
        </Button>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          type="button"
          onClick={() => {}}
          aria-label={assignButtonDescription}
        >
          Assign
        </Button>
      </div>
    </div>
  </div>
);

// TODO [MEG]: use better PropType validation
// look at translatedCourseOfferingCsTopics and translatedCourseOfferingSchoolSubjects
CurriculumCatalogCard.propTypes = {
  courseName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  gradeOrAgeRange: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  topic: PropTypes.string.isRequired,

  // for screenreaders
  imageAltText: PropTypes.string,
  quickViewButtonDescription: PropTypes.string.isRequired,
  assignButtonDescription: PropTypes.string.isRequired
};

CurriculumCatalogCard.defaultProps = {
  imageAltText: '' // for decorative images
};

export default CurriculumCatalogCard;
