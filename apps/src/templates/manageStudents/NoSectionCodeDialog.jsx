import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '../Button';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

const styles = {
  buttonStyle: {
    float: 'right'
  }
};

export default class NoSectionCodeDialog extends React.Component {
  static propTypes = {
    typeClassroom: PropTypes.string,
    handleClose: PropTypes.func
  };

  getClassroomType = () => {
    const {typeClassroom} = this.props;
    return typeClassroom === SectionLoginType.google_classroom
      ? i18n.loginTypeGoogleClassroom()
      : i18n.loginTypeClever();
  };

  render() {
    const classroomType = this.getClassroomType();
    return (
      <div>
        <h3>{i18n.noSectionDialogHeader({classroom: classroomType})}</h3>
        <hr />
        <p>{i18n.noSectionDialogBody({classroom: classroomType})}</p>
        <hr />
        <Button
          __useDeprecatedTag
          onClick={this.props.handleClose}
          color={Button.ButtonColor.orange}
          text={i18n.ok()}
          style={styles.buttonStyle}
        />
      </div>
    );
  }
}
