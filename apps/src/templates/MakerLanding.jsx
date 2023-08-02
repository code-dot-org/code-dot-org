import React, {Component} from 'react';
import TopCourse from './studioHomepages/TopCourse';
import VerticalImageResourceCardRow from './VerticalImageResourceCardRow';
import shapes from './studioHomepages/shapes';
import i18n from '@cdo/locale';
import {MAKER_DEPRECATION_SUPPORT_URL} from '@cdo/apps/lib/kits/maker/util/makerConstants';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';

export default class MakerLanding extends Component {
  static propTypes = {
    topCourse: shapes.topCourse,
  };

  render() {
    const {topCourse} = this.props;

    const cards = [
      {
        title: i18n.makerNewProjectTitle(),
        description: i18n.makerNewProjectDesc(),
        link: '/projects/applab/new?enableMaker=true',
        image: 'applab-project',
        buttonText: i18n.makerNewProjectButton(),
      },
      {
        title: i18n.makerViewProjectsTitle(),
        description: i18n.makerViewProjectsDesc(),
        link: '/projects',
        image: 'applab-marketing',
        buttonText: i18n.makerViewProjectsButton(),
      },
      {
        title: i18n.makerSetupTitle(),
        description: i18n.makerSetupDesc(),
        link: '/maker/setup',
        image: 'maker',
        buttonText: i18n.makerSetupButton(),
      },
    ];

    return (
      <div style={styles.container}>
        <Notification
          type={NotificationType.failure}
          notice={i18n.makerAppDeprecationNoticeTitle()}
          details={i18n.makerAppDeprecationNoticeDetails()}
          detailsLinkText={i18n.makerDeprecationNoticeLinkText()}
          detailsLink={MAKER_DEPRECATION_SUPPORT_URL}
          dismissible
        />
        <h1 style={styles.title}>{i18n.makerAppPageTitle()}</h1>
        <TopCourse
          assignableName={topCourse.assignableName}
          lessonName={topCourse.lessonName}
          linkToOverview={topCourse.linkToOverview}
          linkToLesson={topCourse.linkToLesson}
        />
        <VerticalImageResourceCardRow cards={cards} />
      </div>
    );
  }
}

const styles = {
  title: {
    fontSize: 30,
  },
  container: {
    marginBottom: 20,
  },
};
