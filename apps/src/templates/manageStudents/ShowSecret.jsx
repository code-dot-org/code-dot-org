import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/utils/firehose';
import {pegasus} from '@cdo/apps/util/urlHelpers';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {setSecretImage, setSecretWords} from './manageStudentsRedux';

class ShowSecret extends Component {
  static propTypes = {
    initialIsShowing: PropTypes.bool,
    secretWord: PropTypes.string,
    secretPicture: PropTypes.string,
    loginType: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    secretLoginDisabled: PropTypes.bool,

    // Provided in redux
    setSecretImage: PropTypes.func.isRequired,
    setSecretWords: PropTypes.func.isRequired,
  };

  state = {
    isShowing: !!this.props.initialIsShowing,
  };

  show = () => {
    const {sectionId, id, loginType} = this.props;
    this.setState({
      isShowing: true,
    });
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students',
        event: 'show-secret',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: id,
          loginType: loginType,
        }),
      },
      {includeUserId: true}
    );
  };

  hide = () => {
    const {sectionId, id, loginType} = this.props;
    this.setState({
      isShowing: false,
    });
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students',
        event: 'hide-secret',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: id,
          loginType: loginType,
        }),
      },
      {includeUserId: true}
    );
  };

  reset = () => {
    const {sectionId, id, loginType} = this.props;
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
          this.props.setSecretImage(this.props.id, data.secret_picture_path);
        } else if (this.props.loginType === SectionLoginType.word) {
          this.props.setSecretWords(this.props.id, data.secret_words);
        }
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'manage-students',
            event: 'reset-secret',
            data_json: JSON.stringify({
              sectionId: sectionId,
              studentId: id,
              loginType: loginType,
            }),
          },
          {includeUserId: true}
        );
      })
      .fail((jqXhr, status) => {
        // We may want to handle this more cleanly in the future, but for now this
        // matches the experience we got in angular
        alert(i18n.unexpectedError());
        console.error(status);
      });
  };

  render() {
    const {secretLoginDisabled} = this.props;
    const tooltipId = secretLoginDisabled ? _.uniqueId() : '';
    const showButtonText =
      this.props.loginType === SectionLoginType.word
        ? i18n.showWords()
        : i18n.showPicture();
    const hideButtonText =
      this.props.loginType === SectionLoginType.word
        ? i18n.hideWords()
        : i18n.hidePicture();

    return (
      <div>
        {!this.state.isShowing && (
          <span data-for={tooltipId} data-tip>
            <Button
              onClick={this.show}
              color={Button.ButtonColor.white}
              text={showButtonText}
              disabled={secretLoginDisabled}
              className="uitest-show-picture-or-word"
              style={styles.button}
            />
            <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
              <div>{i18n.disabledForTeacherAccountsTooltip()}</div>
            </ReactTooltip>
          </span>
        )}
        {this.state.isShowing && (
          <div>
            {this.props.loginType === SectionLoginType.word && (
              <p>{this.props.secretWord}</p>
            )}
            {this.props.loginType === SectionLoginType.picture && (
              // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
              // Verify or update this alt-text as necessary
              <img
                src={pegasus('/images/' + this.props.secretPicture)}
                style={styles.image}
                alt=""
              />
            )}
            <Button
              onClick={this.reset}
              color={Button.ButtonColor.blue}
              text={i18n.reset()}
              style={{...styles.button, ...styles.reset}}
              className="uitest-reset-password"
            />
            <Button
              onClick={this.hide}
              color={Button.ButtonColor.white}
              text={hideButtonText}
              style={styles.button}
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  reset: {
    marginRight: 10,
  },
  image: {
    width: 45,
  },
  button: {
    margin: 0,
    boxShadow: 'inset 0 2px 0 0 rgb(255 255 255 / 40%)',
  },
};

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
