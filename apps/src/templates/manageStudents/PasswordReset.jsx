import React, {Component, PropTypes} from 'react';
import Button from '../Button';
import i18n from "@cdo/locale";

const styles = {
  input: {
    width: 100,
    height: 29,
    marginTop: -25,
    marginRight: 10,
  }
};

class PasswordReset extends Component {
  static propTypes = {
    initialIsResetting: PropTypes.bool,
    sectionId: PropTypes.number,
    studentId: PropTypes.number,
  };

  state = {
    isResetting: !!this.props.initialIsResetting,
    input: ''
  };

  reset = () => {
    this.setState({
      isResetting: true
    });
  };

  cancel = () => {
    this.setState({
      isResetting: false,
      input: ''
    });
  };

  save = () => {
    const {sectionId, studentId} = this.props;
    const dataToUpdate = {
      student: {
        password: this.state.input
      }
    };

    $.ajax({
      url: `/dashboardapi/sections/${sectionId}/students/${studentId}`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToUpdate),
    }).done((data) => {
      this.setState({
        isResetting: false,
        input: ''
      });
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  updateInput = (event) => {
    this.setState({
      input: event.target.value
    });
  };

  render() {
    return (
      <div>
        {!this.state.isResetting &&
          <Button onClick={this.reset} color={Button.ButtonColor.white} text={i18n.resetPassword()} />
        }
        {this.state.isResetting &&
          <div>
            <input
              style={styles.input}
              placeholder={i18n.newPassword()}
              value={this.state.input}
              onChange={this.updateInput}
            />
            <Button onClick={this.save} color={Button.ButtonColor.blue} text={i18n.save()} />
            <div>
              <Button onClick={this.cancel} color={Button.ButtonColor.white} text={i18n.cancel()} />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default PasswordReset;
