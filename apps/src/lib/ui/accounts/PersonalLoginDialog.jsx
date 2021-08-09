import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Header, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import Button from '@cdo/apps/templates/Button';
import {ADD_A_PERSONAL_LOGIN_HELP_URL} from '@cdo/apps/lib/util/urlHelpers';

const GUTTER = 20;

export const dependentStudentsShape = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired
  })
).isRequired;

export default class PersonalLoginDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    dependentStudents: dependentStudentsShape,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  };

  render() {
    const {isOpen, dependentStudents, onCancel, onConfirm} = this.props;
    const sortedStudents = _.sortBy(dependentStudents, ['name']);

    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={550}
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.deleteAccountDialog_header()} />
          <p>
            <strong style={styles.dangerText}>
              {i18n.personalLoginDialog_body1({
                numStudents: dependentStudents.length
              })}
            </strong>
            {i18n.personalLoginDialog_body2({
              numStudents: dependentStudents.length
            })}
          </p>
          <div style={styles.studentBox}>
            {sortedStudents.map((student, index) => {
              return (
                <div key={student.id} className="uitest-dependent-student">
                  {index + 1}. {student.name} ({student.username})
                </div>
              );
            })}
          </div>
          <p>
            {i18n.personalLoginDialog_body3()}
            <strong>{i18n.personalLoginDialog_body4()}</strong>
            {i18n.personalLoginDialog_body5()}
          </p>
          <Button
            __useDeprecatedTag
            text={i18n.removeStudentSendHomeInstructions()}
            target="_blank"
            href={ADD_A_PERSONAL_LOGIN_HELP_URL}
            color={Button.ButtonColor.blue}
            size={Button.ButtonSize.large}
            style={styles.button}
            tabIndex="1"
          />
          <p>{i18n.personalLoginDialog_body6()}</p>
          <ConfirmCancelFooter
            confirmText={i18n.personalLoginDialog_button()}
            onConfirm={onConfirm}
            onCancel={onCancel}
            tabIndex="1"
          />
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  container: {
    margin: GUTTER,
    color: color.charcoal
  },
  dangerText: {
    color: color.red
  },
  studentBox: {
    padding: GUTTER / 2,
    marginBottom: GUTTER / 2,
    backgroundColor: color.background_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 4,
    height: 50,
    overflowY: 'scroll'
  },
  button: {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1em'
  }
};
