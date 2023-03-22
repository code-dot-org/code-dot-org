import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';

export default class CurriculumCatalog extends Component {
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
        <h1>{i18n.curriculumCatalogHeaderTitle()}</h1>
        <h2>{i18n.curriculumCatalogHeaderSubtitle()}</h2>
        <img src={CourseCatalogIllustration01} />
        {this.props.curriculaData.map(curriculum => (
          <li key={curriculum.key}>{curriculum.display_name}</li>
        ))}
      </>
    );
  }
}
