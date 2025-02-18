import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {getUnpluggedLessonsForScript} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import i18n from '@cdo/locale';

import DialogFooter from '../../teacherDashboard/DialogFooter';

import LessonStatusList from './LessonStatusList';

class CreateStandardsReportStep1 extends Component {
  static propTypes = {
    onNext: PropTypes.func.isRequired,
    unpluggedLessons: PropTypes.array.isRequired,
  };

  render() {
    return (
      <div>
        <p>{i18n.createStandardsReportPage1Body()}</p>
        <h3>
          {i18n.createStandardsReportStep1() + ' '}
          {i18n.completedUnpluggedLessons()}
        </h3>
        {this.props.unpluggedLessons.length > 0 && (
          <LessonStatusList dialog={'CreateStandardsReportDialog'} />
        )}
        {this.props.unpluggedLessons.length === 0 && (
          <p style={styles.noUnplugged}>
            {i18n.standardsReportNoUnpluggedLessons()}
          </p>
        )}
        <p>{i18n.pluggedLessonsNote()}</p>
        <DialogFooter rightAlign>
          <Button
            text={i18n.next()}
            onClick={this.props.onNext}
            color={Button.ButtonColor.brandSecondaryDefault}
            className="uitest-standards-generate-report-next"
            style={styles.button}
          />
        </DialogFooter>
      </div>
    );
  }
}

const styles = {
  noUnplugged: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    margin: 0,
  },
};

export const UnconnectedCreateStandardsReportStep1 = CreateStandardsReportStep1;

export default connect(state => ({
  unpluggedLessons: getUnpluggedLessonsForScript(state),
}))(CreateStandardsReportStep1);
