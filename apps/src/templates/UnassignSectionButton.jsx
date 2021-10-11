import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {unassignSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';

/**
 * Removes null values from stringified object before sending firehose record
 */
function removeNullValues(key, val) {
  if (val === null || typeof val === undefined) {
    return undefined;
  }
  return val;
}

class UnassignSectionButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    courseName: PropTypes.string,
    buttonLocationAnalytics: PropTypes.string,
    // Redux
    initialUnitId: PropTypes.number,
    initialCourseId: PropTypes.number,
    unassignSection: PropTypes.func.isRequired,
    isRtl: PropTypes.bool
  };

  constructor() {
    super();
    this.state = {
      text: i18n.assigned(),
      showUnassignDialog: false,
      icon: 'check'
    };
  }

  onMouseOver = event => {
    this.setState({text: i18n.unassign(), icon: 'times'});
  };

  onMouseOut = event => {
    this.setState({text: i18n.assigned(), icon: 'check'});
  };

  openUnassignDialog = getState => {
    this.setState({
      showUnassignDialog: true
    });
    firehoseClient.putRecord(
      {
        study: 'assignment',
        event: 'start-course-unassigned-from-section',
        data_json: JSON.stringify(
          {
            sectionId: this.props.sectionId,
            scriptId: this.props.initialUnitId,
            courseId: this.props.initialCourseId,
            location: this.props.buttonLocationAnalytics,
            date: new Date()
          },
          removeNullValues
        )
      },
      {includeUserId: true}
    );
  };

  closeUnassignDialog = getState => {
    this.setState({
      showUnassignDialog: false
    });
    firehoseClient.putRecord(
      {
        study: 'assignment',
        event: 'cancel-course-unassigned-from-section',
        data_json: JSON.stringify(
          {
            sectionId: this.props.sectionId,
            scriptId: this.props.initialUnitId,
            courseId: this.props.initialCourseId,
            location: this.props.buttonLocationAnalytics,
            date: new Date()
          },
          removeNullValues
        )
      },
      {includeUserId: true}
    );
  };

  confirmUnassign = () => {
    this.props.unassignSection(
      this.props.sectionId,
      this.props.buttonLocationAnalytics
    );
  };

  render() {
    const {text, icon, showUnassignDialog} = this.state;
    const {isRtl, sectionId, courseName} = this.props;

    // Adjust styles if locale is RTL
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMargin;

    return (
      <div
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseOut}
        style={buttonMarginStyle}
        className={'uitest-unassign-button'}
      >
        <Button
          __useDeprecatedTag
          color={Button.ButtonColor.green}
          text={text}
          icon={icon}
          onClick={this.openUnassignDialog}
        />
        {showUnassignDialog && (
          <UnassignSectionDialog
            isOpen={true}
            sectionId={sectionId}
            courseName={courseName}
            onClose={this.closeUnassignDialog}
            unassignSection={this.confirmUnassign}
          />
        )}
      </div>
    );
  }
}

const styles = {
  buttonMargin: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center'
  },
  buttonMarginRTL: {
    marginRight: 10,
    display: 'flex',
    alignItems: 'center'
  }
};

export const UnconnectedUnassignSectionButton = UnassignSectionButton;

export default connect(
  state => ({
    isRtl: state.isRtl,
    initialUnitId: state.teacherSections.initialUnitId,
    initialCourseId: state.teacherSections.initialCourseId
  }),
  {unassignSection}
)(UnassignSectionButton);
