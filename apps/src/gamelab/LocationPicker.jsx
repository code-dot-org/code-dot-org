import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  cancelLocationSelection,
  selectLocation,
  isPickingLocation
} from './locationPickerModule';

class LocationPicker extends React.Component {
  static propTypes = {
    pickingLocation: PropTypes.bool.isRequired,

    cancel: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
  };

  select(mouseEvent) {
  }

  render() {
    const playSpace = document.getElementById('divGameLab');
    if (playSpace) {
      playSpace.style.zIndex = this.props.pickingLocation ? 1050 : 0;
      if (this.props.pickingLocation) {
        playSpace.onclick = e => {
          const loc = {x: e.offsetX, y: e.offsetY};
          this.props.select(loc);
        };
      } else {
        playSpace.onclick = null;
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
    select: loc => dispatch(selectLocation(loc)),
  }),
)(LocationPicker);
