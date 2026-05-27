import TextField from '@code-dot-org/component-library/textField';
import {Typography, Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import styleConstants from '@cdo/apps/styleConstants';
import i18n from '@cdo/locale';

import styles from './join-section.module.scss';

const INITIAL_STATE = {
  sectionCode: '',
};

export default class JoinSection extends React.Component {
  static propTypes = {
    enrolledInASection: PropTypes.bool.isRequired,
    updateSections: PropTypes.func.isRequired,
    updateSectionsResult: PropTypes.func.isRequired,
    isTeacher: PropTypes.bool,
  };

  state = {...INITIAL_STATE};

  fetchCaptchaInfo = () => {
    $.get({
      url: '/api/v1/sections/require_captcha',
      dataType: 'json',
    }).done(data => {
      const {key} = data;
      this.setState({key});
    });
  };

  componentDidMount() {
    this.fetchCaptchaInfo();
  }

  handleChange = event => this.setState({sectionCode: event.target.value});

  handleKeyUp = event => {
    if (event.key === 'Enter') {
      this.joinSection();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  joinSection = () => {
    const sectionCode = this.state.sectionCode;
    const normalizedSectionCode = sectionCode.trim().toUpperCase();

    this.setState(INITIAL_STATE);

    $.post({
      url: `/api/v1/sections/${normalizedSectionCode}/join`,
      dataType: 'json',
    })
      .done(data => {
        const section = data.sections.find(
          s => s.code === normalizedSectionCode
        );
        const sectionName = section.name;
        const joiningPlSection = section.grades?.includes('pl');
        this.props.updateSections(data.studentSections, data.plSections);
        this.props.updateSectionsResult(
          'join',
          data.result,
          sectionName,
          sectionCode,
          null,
          joiningPlSection
        );
      })
      .fail(data => {
        const result =
          data.responseJSON && data.responseJSON.result
            ? data.responseJSON.result
            : 'fail';
        const sectionCapacity =
          data.responseJSON && data.responseJSON.sectionCapacity
            ? data.responseJSON.sectionCapacity
            : null;
        this.props.updateSectionsResult(
          'join',
          result,
          null,
          normalizedSectionCode,
          sectionCapacity
        );
      });
  };

  render() {
    const {enrolledInASection, isTeacher} = this.props;

    return (
      <div
        className={classNames(
          styles.main,
          !enrolledInASection && styles.mainDashed
        )}
        style={{width: styleConstants['content-width']}}
      >
        <div className={styles.wordBox}>
          <Typography variant="h3" component="div" className={styles.heading}>
            {i18n.joinASection()}
          </Typography>
          <Typography
            variant="body3"
            component="div"
            className={styles.details}
          >
            {isTeacher
              ? i18n.joinSectionTeacherDescription()
              : i18n.joinSectionDescription()}
          </Typography>
        </div>
        <div className={styles.actionBox}>
          <TextField
            name="sectionCode"
            className="ui-test-join-section"
            value={this.state.sectionCode}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            placeholder={i18n.joinSectionPlaceholder()}
          />
          <MuiButton
            onClick={this.joinSection}
            className="ui-test-join-section"
            variant="contained"
            color="primary"
            disabled={this.state.sectionCode.length === 0}
          >
            {i18n.joinSection()}
          </MuiButton>
        </div>
      </div>
    );
  }
}

export const UnconnectedJoinSection = JoinSection;
