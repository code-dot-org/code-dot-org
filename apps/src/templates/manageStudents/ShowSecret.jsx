import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Button from '../Button';
import i18n from "@cdo/locale";
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {setSecretImage, setSecretWords} from './manageStudentsRedux';

const styles = {
  reset: {
    marginRight: 10,
  },
  image: {
    width: 45
  }
};

class ShowSecret extends Component {
  static propTypes = {
    initialIsShowing: PropTypes.bool,
    sectionId: PropTypes.number.isRequired,
    student: PropTypes.shape({
      secretWords: PropTypes.string,
      secretPicture: PropTypes.string,
      loginType: PropTypes.string.isRequired
    }).isRequired,
    // Provided in redux
    setSecretImage: PropTypes.func.isRequired,
    setSecretWords: PropTypes.func.isRequired,
  };

  state = {
    isShowing: !!this.props.initialIsShowing,
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
    const {sectionId, student, setSecretImage, setSecretWords} = this.props;
    const dataToUpdate = {
      secrets: "reset_secrets",
      student
    };

    $.ajax({
      url: `/dashboardapi/sections/${sectionId}/students/${student.id}`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToUpdate),
    }).done((data) => {
      if (student.loginType === SectionLoginType.picture) {
        setSecretImage(student.id, data.secret_picture_path);
      } else if (student.loginType === SectionLoginType.word) {
        setSecretWords(student.id, data.secret_words);
      }
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  render() {
    const {student} = this.props;
    return (
      <div>
        {!this.state.isShowing &&
          <Button onClick={this.show} color={Button.ButtonColor.white} text={i18n.showSecret()} />
        }
        {this.state.isShowing &&
          <div>
            {student.loginType === SectionLoginType.word &&
              <p>{student.secretWords}</p>
            }
            {student.loginType === SectionLoginType.picture &&
              <img src={'/images/' + student.secretPicturePath} style={styles.image} />
            }
            <Button onClick={this.reset} color={Button.ButtonColor.blue} text={i18n.reset()} style={styles.reset} />
            <Button onClick={this.hide} color={Button.ButtonColor.white} text={i18n.hideSecret()} />
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedShowSecret = ShowSecret;

export default connect(state => ({}), dispatch => ({
  setSecretImage(id, image) {
    dispatch(setSecretImage(id, image));
  },
  setSecretWords(id, words) {
    dispatch(setSecretWords(id, words));
  },
}))(ShowSecret);
