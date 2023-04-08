import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {curriculaDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';

class CurriculumCatalog extends Component {
  static propTypes = {
    curriculaData: PropTypes.arrayOf(curriculaDataShape)
  };

  render() {
    return (
      <>
        <div className={style.catalogHeader}>
          <HeaderBanner
            headingText={i18n.curriculumCatalogHeaderTitle()}
            subHeadingText={i18n.curriculumCatalogHeaderSubtitle()}
            short={false}
            imageUrl={CourseCatalogIllustration01}
          />
        </div>
        <div className={style.catalogContentContainer}>
          <div className={style.catalogContent}>
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
