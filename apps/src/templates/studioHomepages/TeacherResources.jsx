import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import ImageResourceCard from './ImageResourceCard';
import ContentContainer from '../ContentContainer';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from "../../util/color";

const styles = {
  spacer: {
    width: 20,
    color: color.white
  },
  ltr: {
    float: 'left'
  },
  rtl: {
    float: 'right'
  }
};


const TeacherResources = React.createClass({
  propTypes: {
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { isRtl } = this.props;
    const planUrl = pegasus('/teacher-dashboard#/plan');
    const volunteerUrl = pegasus('/volunteer/local');
    const localeStyle = isRtl ? styles.rtl : styles.ltr;
    return (
      <ContentContainer
        heading={i18n.resources()}
      >
        <ImageResourceCard
          title={i18n.teacherCommunity()}
          description={i18n.teacherCommunityDescription()}
          image="teacher-community"
          buttonText={i18n.joinCommunity()}
          link="https://forum.code.org"
        />
        <div style={[styles.spacer, localeStyle]}>.</div>
        <ImageResourceCard
          title={i18n.professionalLearning()}
          description={i18n.professionalLearningDescription()}
          image="professional-learning"
          buttonText={i18n.learnMore()}
          link="/my-professional-learning"
        />
        <ImageResourceCard
          title={i18n.standardsAndFramework()}
          description={i18n.standardsAndFrameworkDescription()}
          image="standards-framework"
          buttonText={i18n.reviewDocuments()}
          link={planUrl}
        />
        <div style={[styles.spacer, localeStyle]}>.</div>
        <ImageResourceCard
          title={i18n.findGuestSpeaker()}
          description={i18n.findGuestSpeakerDescription()}
          image="guest-speaker"
          buttonText={i18n.inspireStudents()}
          link={volunteerUrl}
        />
      </ContentContainer>
    );
  }
});

export default connect(state => ({
  isRtl: state.isRtl
}))(Radium(TeacherResources));
