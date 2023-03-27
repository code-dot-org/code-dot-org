import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import '../../../style/code-studio/curriculum_catalog.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';

class CurriculumCatalog extends Component {
  static propTypes = {
    curriculaData: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        key: PropTypes.string,
        display_name: PropTypes.string,
        category: PropTypes.string,
        is_featured: PropTypes.bool,
        assignable: PropTypes.bool,
        curriculum_type: PropTypes.string,
        marketing_initiative: PropTypes.string,
        grade_levels: PropTypes.string,
        header: PropTypes.string,
        image: PropTypes.string,
        cs_topic: PropTypes.string,
        school_subject: PropTypes.string,
        device_compatibility: PropTypes.string
      })
    )
  };

  render() {
    return (
      <>
        <div className={'catalogHeader'}>
          <HeaderBanner
            headingText={i18n.curriculumCatalogHeaderTitle()}
            subHeadingText={i18n.curriculumCatalogHeaderSubtitle()}
            short={false}
            imageUrl={CourseCatalogIllustration01}
          />
        </div>
        <div className={'contentContainer'}>
          <div className={'content'}>
            {this.props.curriculaData.map(curriculum => (
              <li key={curriculum.key}>{curriculum.display_name}</li>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default CurriculumCatalog;
