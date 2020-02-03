import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import OwnedSections from '../teacherDashboard/OwnedSections';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';

class TeacherSections extends Component {
  static propTypes = {
    queryStringOpen: PropTypes.string,
    locale: PropTypes.string,

    //Redux provided
    asyncLoadSectionData: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.asyncLoadSectionData();
  }

  render() {
    const {queryStringOpen, locale} = this.props;

    return (
      <div id="classroom-sections">
        <ContentContainer heading={i18n.sectionsTitle()}>
          <OwnedSections queryStringOpen={queryStringOpen} locale={locale} />
        </ContentContainer>
      </div>
    );
  }
}
export const UnconnectedTeacherSections = TeacherSections;
export default connect(
  undefined,
  {
    asyncLoadSectionData
  }
)(TeacherSections);
