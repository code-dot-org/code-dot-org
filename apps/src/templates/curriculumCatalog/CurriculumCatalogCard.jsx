import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import {cardImageNamesToSrc} from '@cdo/apps/templates/curriculumCatalog/cardImageNamesToSrc';
import '../../../../shared/css/phase1-design-system.scss';

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
  <div className="curriculumCatalogContainer">
    <img src={cardImageNamesToSrc[imageName]} alt={imageAltText} />
    {/*topic should have color $brand_primary_default */}
    <p className="overline">{topic}</p>
    <h4>{courseName}</h4>
    {/* display: flex for divs with icons*/}
    <div className="gradeOrAge">
      {/* add right padding to icons */}
      <FontAwesome icon={'user'} className={'fa-solid'} />
      <div>{gradeOrAgeRange}</div>
    </div>
    <div className="duration">
      {/*TODO [MEG]: Update this to be clock fa-solid when we update FontAwesome */}
      <FontAwesome icon={'clock-o'} />
      <div>{duration}</div>
    </div>
    {/* display: flex; justify-content: space-between for buttons*/}
    <div className="quickViewAndAssignButtonContainer">
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
  imageAltText: '' // for decorative images.
};

export default CurriculumCatalogCard;
