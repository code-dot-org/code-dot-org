import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import OwnedSections from '../teacherDashboard/OwnedSections';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';
import Notification from '../Notification';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

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

    /*
     * TODO (dmcavoy): Remove for May 31st launch
     * Temporary notification for the experiment facilitators will be using to
     * see the mini rubric and assessment re-design from May 1 to May 31st
     */
    const inMiniRubricExperiment = experiments.isEnabled(
      experiments.MINI_RUBRIC_2019
    );
    return (
      <div id="classroom-sections">
        {inMiniRubricExperiment && (
          <Notification
            type={'bullhorn'}
            notice={'Experiment Enabled'}
            details={
              <UnsafeRenderedMarkdown
                markdown={
                  'The Mini Rubric and Assessment Re-design experiment is enabled for your account. To disable this experiment go [here](/home?disableExperiments=2019-mini-rubric).'
                }
              />
            }
            dismissible={true}
            newWindow={false}
          />
        )}
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
