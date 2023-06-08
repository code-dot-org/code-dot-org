import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import OwnedSections from '../teacherDashboard/OwnedSections';
import {
  asyncLoadSectionData,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
} from '../teacherDashboard/teacherSectionsRedux';
import SetUpSections from './SetUpSections';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import RosterDialog from '../teacherDashboard/RosterDialog';
import AddSectionDialog from '../teacherDashboard/AddSectionDialog';

class TeacherSections extends Component {
  static propTypes = {
    //Redux provided
    asyncLoadSectionData: PropTypes.func.isRequired,
    studentSectionIds: PropTypes.array,
    plSectionIds: PropTypes.array,
    hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    hiddenStudentSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    asyncLoadComplete: PropTypes.bool,
  };

  componentDidMount() {
    this.props.asyncLoadSectionData();
  }

  render() {
    const {
      plSectionIds,
      studentSectionIds,
      hiddenPlSectionIds,
      hiddenStudentSectionIds,
    } = this.props;

    const hasSections =
      this.props.studentSectionIds?.length > 0 ||
      this.props.plSectionIds?.length > 0;

    return (
      <div id="classroom-sections">
        <ContentContainer heading={i18n.createSection()}>
          {this.props.asyncLoadComplete && (
            <SetUpSections hasSections={hasSections} />
          )}
          {!this.props.asyncLoadComplete && (
            <Spinner size="large" style={styles.spinner} />
          )}
        </ContentContainer>
        {this.props.studentSectionIds?.length > 0 && (
          <ContentContainer heading={i18n.sectionsTitle()}>
            <OwnedSections
              sectionIds={studentSectionIds}
              hiddenSectionIds={hiddenStudentSectionIds}
            />
          </ContentContainer>
        )}
        {this.props.plSectionIds?.length > 0 && (
          <ContentContainer heading={i18n.plSectionsTitle()}>
            <OwnedSections
              isPlSections={true}
              sectionIds={plSectionIds}
              hiddenSectionIds={hiddenPlSectionIds}
            />
          </ContentContainer>
        )}
        <RosterDialog />
        <AddSectionDialog />
      </div>
    );
  }
}
export const UnconnectedTeacherSections = TeacherSections;
export default connect(
  state => ({
    studentSectionIds: state.teacherSections.studentSectionIds,
    plSectionIds: state.teacherSections.plSectionIds,
    hiddenPlSectionIds: hiddenPlSectionIds(state),
    hiddenStudentSectionIds: hiddenStudentSectionIds(state),
    asyncLoadComplete: state.teacherSections.asyncLoadComplete,
  }),
  {
    asyncLoadSectionData,
  }
)(TeacherSections);

const styles = {
  spinner: {
    marginTop: '10px',
  },
};
