/** @file controls below an animation thumbnail */
import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import color from "../../util/color";
import Radium from 'radium';
import SpeedSlider from '../../templates/SpeedSlider';
import ItemLoopToggle from './ItemLoopToggle';
import DeleteAnimationDialog from './DeleteAnimationDialog';

var styles = {
  root: {
    marginRight: 6,
    marginLeft: 6,
    marginTop: 6,
    textAlign: 'center',
    color: color.white,
    fontSize: 24
  },
  icon: {
    cursor: 'pointer',
    float: 'left',
    padding: 2,
    borderWidth: 1,
    borderRadius: 4,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  trash: {
    marginRight: 12
  },
  looping: {
    marginRight: 10,
    marginTop: 6
  },
  previewControls: {
    height: 32,
    display: 'inline-block'
  }
};

var sliderStyle = {
  float: 'none',
  display: 'block'
};

/**
 * The delete and duplicate controls beneath an animation or frame thumbnail.
 */
const ListItemButtons = React.createClass({
  propTypes: {
    onCloneClick: React.PropTypes.func.isRequired,
    onDeleteClick: React.PropTypes.func.isRequired,
    onLoopingChanged: React.PropTypes.func.isRequired,
    looping: React.PropTypes.bool.isRequired,
    onFrameDelayChanged: React.PropTypes.func.isRequired,
    frameDelay: React.PropTypes.number.isRequired,
    singleFrameAnimation: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      isDeleteDialogOpen: false
    };
  },

  closeDeleteDialog() {
    this.setState({isDeleteDialogOpen: false});
  },

  openDeleteDialog() {
    this.setState({isDeleteDialogOpen: true});
  },

  onDeleteItem(evt) {
    this.closeDeleteDialog();
    this.props.onDeleteClick();
    evt.stopPropagation();
  },

  render() {
    const trashTooltip = (<Tooltip id={0}>Delete</Tooltip>);
    const cloneTooltip = (<Tooltip id={0}>Duplicate</Tooltip>);
    let props = this.props;
    return (
      <div>
        <div style={styles.root}>
          {!props.singleFrameAnimation &&
            <SpeedSlider style={sliderStyle} hasFocus={true} value={props.frameDelay} lineWidth={120} onChange={props.onFrameDelayChanged}/>
          }
          <div style={styles.previewControls}>
            {!props.singleFrameAnimation &&
              <ItemLoopToggle style={styles.looping} onToggleChange={props.onLoopingChanged} looping={props.looping} />
            }
            <OverlayTrigger overlay={trashTooltip} placement="bottom" delayShow={500}>
              <i
                key="trash"
                className="fa fa-trash-o"
                style={[styles.icon, styles.trash]}
                onClick={this.openDeleteDialog}
              />
            </OverlayTrigger>
            <OverlayTrigger overlay={cloneTooltip} placement="bottom" delayShow={500}>
              <i
                key="clone"
                className="fa fa-clone"
                style={styles.icon}
                onClick={props.onCloneClick}
              />
            </OverlayTrigger>
          </div>
        </div>
        <DeleteAnimationDialog
          onDelete={this.onDeleteItem}
          onCancel={this.closeDeleteDialog}
          isOpen={this.state.isDeleteDialogOpen}
        />
      </div>
    );
  }
});

module.exports = Radium(ListItemButtons);
