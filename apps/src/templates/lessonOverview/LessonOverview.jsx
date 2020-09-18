import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import i18n from '@cdo/locale';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import Announcements from '../../code-studio/components/progress/Announcements';
import {connect} from 'react-redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import LessonFrontPageLeftColumn from '@cdo/apps/templates/lessonOverview/LessonFrontPageLeftColumn';
import LessonFrontPageRightColumn from '@cdo/apps/templates/lessonOverview/LessonFrontPageRightColumn';

const styles = {
  frontPage: {
    display: 'flex',
    flexDirection: 'row'
  },
  left: {
    flexGrow: 2
  },
  right: {
    flexGrow: 1,
    padding: 10,
    borderLeft: 'solid 1px black'
  }
};

class LessonOverview extends Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    overview: PropTypes.string,
    activities: PropTypes.array,
    purpose: PropTypes.string,
    preparation: PropTypes.string,

    //redux
    announcements: PropTypes.arrayOf(announcementShape),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired
  };

  render() {
    const {
      displayName,
      overview,
      announcements,
      isSignedIn,
      viewAs,
      purpose,
      preparation
    } = this.props;
    return (
      <div>
        {isSignedIn && (
          <Announcements
            announcements={announcements}
            width={970}
            viewAs={viewAs}
          />
        )}
        <h1>{displayName}</h1>

        <div style={styles.frontPage}>
          <div style={styles.left}>
            <LessonFrontPageLeftColumn overview={overview} purpose={purpose} />
          </div>
          <div style={styles.right}>
            <LessonFrontPageRightColumn preparation={preparation} />
          </div>
        </div>

        <h2>{i18n.teachingGuide()}</h2>
        {this.props.activities.map(activity => (
          <Activity activity={activity} key={activity.key} />
        ))}
      </div>
    );
  }
}

export const UnconnectedLessonOverview = LessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs
}))(LessonOverview);
