import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import Button from '../Button';
import i18n from '@cdo/locale';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {setSecretImage, setSecretWords} from './manageStudentsRedux';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  reset: {
    marginRight: 10
  },
  image: {
    width: 45
  }
};

class ShowSecret extends Component {
  static propTypes = {
    initialIsShowing: PropTypes.bool,
    secretWord: PropTypes.string,
    secretPicture: PropTypes.string,
    loginType: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    resetDisabled: PropTypes.bool,

    // Provided in redux
    setSecretImage: PropTypes.func.isRequired,
    setSecretWords: PropTypes.func.isRequired
  };

  state = {
    isShowing: !!this.props.initialIsShowing
  };

  show = () => {
    this.setState({
      isShowing: true
    });
  };

  hide = () => {
    this.setState({
      isShowing: false
    });
  };

  reset = () => {
    const dataToUpdate = {
      secrets: 'reset_secrets',
      student: {id: this.props.id}
    };

    $.ajax({
      url: `/dashboardapi/sections/${this.props.sectionId}/students/${
        this.props.id
      }`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToUpdate)
    })
      .done(data => {
        if (this.props.loginType === SectionLoginType.picture) {
          this.props.setSecretImage(this.props.id, data.secret_picture_path);
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
    const {resetDisabled} = this.props;
    const tooltipId = resetDisabled && _.uniqueId();

    return (
      <div>
        {!this.state.isShowing && (
          <Button
            onClick={this.show}
            color={Button.ButtonColor.white}
            text={i18n.showSecret()}
          />
        )}
        {this.state.isShowing && (
          <div>
            {this.props.loginType === SectionLoginType.word && (
              <p>{this.props.secretWord}</p>
            )}
            {this.props.loginType === SectionLoginType.picture && (
              <img
                src={pegasus('/images/' + this.props.secretPicture)}
                style={styles.image}
              />
            )}
            <span data-for={tooltipId} data-tip>
              <Button
                onClick={this.reset}
                color={Button.ButtonColor.blue}
                text={i18n.reset()}
                style={styles.reset}
                disabled={resetDisabled}
                className="uitest-reset-password"
              />
              {resetDisabled && (
                <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
                  <div>{i18n.resetTeacherPasswordTooltip()}</div>
                </ReactTooltip>
              )}
            </span>
            <Button
              onClick={this.hide}
              color={Button.ButtonColor.white}
              text={i18n.hideSecret()}
            />
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
    }
  })
)(ShowSecret);
