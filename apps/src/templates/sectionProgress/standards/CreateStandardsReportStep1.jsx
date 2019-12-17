import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {LessonStatusList} from './LessonStatusList';
import Button from '../../Button';
import DialogFooter from '../../teacherDashboard/DialogFooter';

export class CreateStandardsReportStep1 extends Component {
  static propTypes = {
    onNext: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <p>{i18n.createStandardsReportPage1Body()}</p>
        <h3>
          {i18n.createStandardsReportStep1() + ' '}
          {i18n.completedUnpluggedLessons()}
        </h3>
        <LessonStatusList />
        <div>{i18n.pluggedLessonsNote()}</div>
        <DialogFooter rightAlign>
          <Button
            text={i18n.next()}
            onClick={this.props.onNext}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </div>
    );
  }
}

export const UnconnectedCreateStandardsReportStep1 = CreateStandardsReportStep1;
