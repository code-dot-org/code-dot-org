import {Button as MuiButton} from '@mui/material';
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {setSecretImage, setSecretWords} from './manageStudentsRedux';

import moduleStyles from './showSecret.module.scss';

class ShowSecret extends Component {
  static propTypes = {
    initialIsShowing: PropTypes.bool,
    secretWord: PropTypes.string,
    secretPictureUrl: PropTypes.string,
    loginType: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    secretLoginDisabled: PropTypes.bool,
    resetDisabled: PropTypes.bool,
    isDemoStudent: PropTypes.bool,

    // Provided in redux
    setSecretImage: PropTypes.func.isRequired,
    setSecretWords: PropTypes.func.isRequired,
  };

  state = {
    isShowing: !!this.props.initialIsShowing,
  };

  show = () => {
    this.setState({
      isShowing: true,
    });
  };

  hide = () => {
    this.setState({
      isShowing: false,
    });
  };

  reset = () => {
    // Demo students intentionally cannot be mutated; the reset button is
    // disabled in render but guard the network call as a safety belt.
    if (this.props.isDemoStudent) {
      return;
    }
    const dataToUpdate = {
      secrets: 'reset_secrets',
      student: {id: this.props.id},
    };

    $.ajax({
      url: `/dashboardapi/sections/${this.props.sectionId}/students/${this.props.id}`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToUpdate),
    })
      .done(data => {
        if (this.props.loginType === SectionLoginType.picture) {
          this.props.setSecretImage(this.props.id, data.secret_picture_url);
        } else if (this.props.loginType === SectionLoginType.word) {
          this.props.setSecretWords(this.props.id, data.secret_words);
        }
      })
      .fail((jqXhr, status) => {
        // We may want to handle this more cleanly in the future, but for now this
        // matches the experience we got in angular
        alert(i18n.unexpectedError());
        console.error(status);
      });
  };

  render() {
    const {secretLoginDisabled, resetDisabled, isDemoStudent} = this.props;
    const tooltipId = secretLoginDisabled ? _.uniqueId() : '';
    const resetTooltipId = resetDisabled ? _.uniqueId() : '';
    const tooltipText = isDemoStudent
      ? 'Password actions are not available for demo section students.'
      : i18n.disabledForTeacherAccountsTooltip();
    const showButtonText =
      this.props.loginType === SectionLoginType.word
        ? i18n.showWords()
        : i18n.showPicture();
    const hideButtonText =
      this.props.loginType === SectionLoginType.word
        ? i18n.hideWords()
        : i18n.hidePicture();

    return (
      <div className={moduleStyles.showSecretContainer}>
        {!this.state.isShowing && (
          <span data-for={tooltipId} data-tip>
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={this.show}
              disabled={secretLoginDisabled}
              className="uitest-show-picture-or-word"
              type="button"
            >
              {showButtonText}
            </MuiButton>
            <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
              <div>{tooltipText}</div>
            </ReactTooltip>
          </span>
        )}
        {this.state.isShowing && (
          <div className={moduleStyles.showRow}>
            {this.props.loginType === SectionLoginType.word && (
              <p>{this.props.secretWord}</p>
            )}
            {this.props.loginType === SectionLoginType.picture && (
              // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
              // Verify or update this alt-text as necessary
              <img
                src={this.props.secretPictureUrl}
                className={moduleStyles.image}
                alt=""
              />
            )}
            <span data-for={resetTooltipId} data-tip>
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.reset}
                disabled={resetDisabled}
                className="uitest-reset-password"
                type="button"
              >
                {i18n.reset()}
              </MuiButton>
              {resetDisabled && (
                <ReactTooltip id={resetTooltipId} role="tooltip" effect="solid">
                  <div>{tooltipText}</div>
                </ReactTooltip>
              )}
            </span>
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={this.hide}
              type="button"
            >
              {hideButtonText}
            </MuiButton>
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedShowSecret = ShowSecret;

export default connect(
  state => ({}),
  dispatch => ({
    setSecretImage(id, image) {
      dispatch(setSecretImage(id, image));
    },
    setSecretWords(id, words) {
      dispatch(setSecretWords(id, words));
    },
  })
)(ShowSecret);
