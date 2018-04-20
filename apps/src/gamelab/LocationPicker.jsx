import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  cancelLocationSelection,
  selectLocation,
  updateLocation,
  isPickingLocation
} from './locationPickerModule';

class LocationPicker extends React.Component {
  static propTypes = {
    pickingLocation: PropTypes.bool.isRequired,

    cancel: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
  };

  render() {
    const playSpace = document.getElementById('divGameLab');
    const visualizationOverlay = document.getElementById('visualizationOverlay');
    if (playSpace) {
      const zIndex = this.props.pickingLocation ? 1050 : 0;
      playSpace.style.zIndex = zIndex;
      visualizationOverlay.style.zIndex = zIndex;
      if (this.props.pickingLocation) {
        playSpace.onmouseup = e => {
          const loc = {x: e.offsetX, y: e.offsetY};
          this.props.select(loc);
        };
        playSpace.onmousemove = e => {
          const loc = {x: e.offsetX, y: e.offsetY};
          this.props.update(loc);
        };
      } else {
        playSpace.onclick = null;
        playSpace.onmousemove = null;
      }
    }
    if (!this.props.pickingLocation) {
      return null;
    }
    return (
      <div>
        <div className={"modal-backdrop"} onClick={() => this.props.cancel()} />
      </div>
    );
  }
}

export default connect(
  state => ({
    pickingLocation: isPickingLocation(state.locationPicker),
  }),
  dispatch => ({
    cancel: () => dispatch(cancelLocationSelection()),
    update: loc => dispatch(updateLocation(loc)),
    select: loc => dispatch(selectLocation(loc)),
  }),
)(LocationPicker);
