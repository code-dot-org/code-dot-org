import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import LessonTip, {
  tipTypes
} from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import _ from 'lodash';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  textArea: {
    width: '95%'
  }
};

export default class EditTipDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    tip: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      tip: this.props.tip
    };
  }

  handleTextChange = event => {
    const newTip = _.cloneDeep(this.state.tip);
    const markdown = event.target.value;
    newTip.markdown = markdown;
    this.setState({tip: newTip});
  };

  handleTipTypeChange = event => {
    const newTip = _.cloneDeep(this.state.tip);
    const type = event.target.value;
    console.log(event.target.value);
    newTip.type = type;
    this.setState({tip: newTip});
  };

  handleClose = () => {
    this.props.handleConfirm(this.state.tip);
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
        style={styles.dialog}
      >
        <div style={styles.dialogContent}>
          <h2>Add Tip</h2>
          <select
            onChange={this.handleTipTypeChange}
            defaultValue={tipTypes[this.state.tip.type].displayName}
          >
            {Object.values(tipTypes).map((tip, index) => {
              return (
                <option
                  value={Object.keys(tipTypes)[index]}
                  key={`tip-${index}`}
                >
                  {tip.displayName}
                </option>
              );
            })}
          </select>
          <textarea
            defaultValue={this.state.tip.markdown}
            onChange={this.handleTextChange}
            style={styles.textArea}
          />
          <LessonTip tip={this.state.tip} />
        </div>
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.closeAndSave()}
            onClick={this.handleClose}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
