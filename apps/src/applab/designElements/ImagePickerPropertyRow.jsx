/* global dashboard */

import PropTypes from 'prop-types';
import React from 'react';

import * as rowStyle from './rowStyle';
import {getStore} from '../../redux';

// We'd prefer not to make GET requests every time someone types a character.
// This is the amount of time that must pass between edits before we'll do a GET
// I expect that the vast majority of time, people will be copy/pasting URLs
// instead of typing them manually, which will result in an immediate GET,
// unless they pasted within USER_INPUT_DELAY ms of editing the field manually
const USER_INPUT_DELAY = 1500;

export default class ImagePickerPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
    elementId: PropTypes.string,
    currentImageType: PropTypes.string
  };

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  state = {
    value: this.props.initialValue,
    lastEdit: 0
  };

  changeUnlessEditing(filename) {
    if (Date.now() - this.state.lastEdit >= USER_INPUT_DELAY) {
      this.changeImage(filename);
    }
  }

  handleChangeInternal = event => {
    const filename = event.target.value;
    this.changeUnlessEditing(filename);

    this.setState({
      value: filename,
      lastEdit: Date.now()
    });

    // We may not have changed file yet (if we still actively editing)
    setTimeout(
      function() {
        this.changeUnlessEditing(this.state.value);
      }.bind(this),
      USER_INPUT_DELAY
    );
  };

  handleButtonClick = () => {
    // TODO: This isn't the pure-React way of referencing the AssetManager
    // component. Ideally we'd be able to `require` it directly without needing
    // to know about `designMode`.
    //
    // However today the `createModalDialog` function and `Dialog` component
    // are intertwined with `StudioApp` which is why we have this direct call.
    dashboard.assets.showAssetManager(this.changeImage, 'image', null, {
      showUnderageWarning: !getStore().getState().pageConstants.is13Plus,
      elementId: this.props.elementId,
      currentValue: this.state.value,
      currentImageType: this.props.currentImageType
    });
  };

  changeImage = (filename, timestamp) => {
    this.props.handleChange(filename, timestamp);
    // Because we delay the call to this function via setTimeout, we must be sure not
    // to call setState after the component is unmounted, or React will warn and
    // tests will fail.
    if (this.isMounted_) {
      this.setState({value: filename});
    }
  };

  render() {
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <input
            className="imagePickerInput"
            value={this.state.value}
            onChange={this.handleChangeInternal}
            style={rowStyle.input}
          />
          &nbsp;
          <a style={rowStyle.link} onClick={this.handleButtonClick}>
            Choose...
          </a>
        </div>
      </div>
    );
  }
}
