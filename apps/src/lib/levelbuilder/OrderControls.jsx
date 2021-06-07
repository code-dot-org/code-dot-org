import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ActivitySection from '@cdo/apps/templates/lessonOverview/activities/ActivitySection';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import color from '@cdo/apps/util/color';

export default class OrderControls extends Component {
  static propTypes = {
    move: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    item: PropTypes.object,
    itemType: PropTypes.oneOf(['activity', 'activitySection'])
  };

  state = {
    showConfirm: false
  };

  handleMoveUp = () => {
    this.props.move('up');
  };

  handleMoveDown = () => {
    this.props.move('down');
  };

  handleRemove = () => {
    this.setState({showConfirm: true});
  };

  handleConfirm = () => {
    this.setState({showConfirm: false});
    this.props.remove();
  };

  handleClose = () => {
    this.setState({showConfirm: false});
  };

  render() {
    const {showConfirm} = this.state;
    const {name, item, itemType} = this.props;
    const text = `Are you sure you want to remove "${name}" and all its contents from the script?`;
    return (
      <div style={styles.controls}>
        <i
          onMouseDown={this.handleMoveUp}
          style={styles.controlIcon}
          className="fa fa-caret-up"
        />
        <i
          onMouseDown={this.handleMoveDown}
          style={styles.controlIcon}
          className="fa fa-caret-down"
        />
        <i
          onMouseDown={this.handleRemove}
          style={styles.controlIcon}
          className="fa fa-trash"
        />
        <BaseDialog
          isOpen={showConfirm}
          handleClose={this.handleClose}
          useUpdatedStyles
          style={styles.dialog}
        >
          <h2>{text}</h2>
          {item && itemType && (
            <div style={styles.previewContainer}>
              <h4>Preview of Content To Delete: </h4>
              <div style={styles.preview}>
                {itemType === 'activity' && <Activity activity={item} />}
                {itemType === 'activitySection' && (
                  <ActivitySection section={item} />
                )}
              </div>
            </div>
          )}
          <DialogFooter rightAlign>
            <Button
              text={'Cancel'}
              onClick={this.handleClose}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={'Delete'}
              onClick={this.handleConfirm}
              color={Button.ButtonColor.red}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  controls: {
    display: 'flex'
  },
  controlIcon: {
    margin: '0 5px',
    cursor: 'pointer'
  },
  previewContainer: {
    color: color.default_text
  },
  preview: {
    border: '1px solid #ccc',
    padding: '5px 25px'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    width: 970,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif',
    marginLeft: -500
  }
};
