import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import styleConstants from '../../styleConstants';

const INITIAL_STATE = {
  sectionCode: '',
};

class JoinSection extends React.Component {
  static propTypes = {
    enrolledInASection: PropTypes.bool.isRequired,
    updateSections: PropTypes.func.isRequired,
    updateSectionsResult: PropTypes.func.isRequired,
    isTeacher: PropTypes.bool,

    // Provided by Redux
    isRtl: PropTypes.bool,
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
    const {enrolledInASection, isRtl} = this.props;

    // Adjust styles for RTL
    const wordBoxStyle = {...styles.wordBox, ...(isRtl && styles.wordBoxRTL)};

    return (
      <div
        style={{
          ...styles.main,
          ...(enrolledInASection ? styles.main : styles.mainDashed),
        }}
      >
        <div style={wordBoxStyle}>
          <div style={styles.heading}>{i18n.joinASection()}</div>
          <div style={styles.details}>
            {this.props.isTeacher
              ? i18n.joinSectionTeacherDescription()
              : i18n.joinSectionDescription()}
          </div>
        </div>
        <div style={styles.actionBox}>
          <input
            type="text"
            name="sectionCode"
            className="ui-test-join-section"
            value={this.state.sectionCode}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            style={styles.inputBox}
            placeholder={i18n.joinSectionPlaceholder()}
          />
          <Button
            onClick={this.joinSection}
            className="ui-test-join-section"
            color={Button.ButtonColor.brandSecondaryDefault}
            disabled={this.state.sectionCode.length === 0}
            text={i18n.joinSection()}
            style={styles.button}
          />
        </div>
        <div style={styles.clear} />
      </div>
    );
  }
}

const styles = {
  main: {
    display: 'flex',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.neutral_dark20,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
  },
  mainDashed: {
    borderWidth: 5,
    borderStyle: 'dashed',
    borderColor: color.border_gray,
    boxSizing: 'border-box',
  },
  heading: {
    ...fontConstants['main-font-regular'],
    fontSize: 20,
    backgroundColor: color.white,
    color: color.neutral_dark,
  },
  details: {
    ...fontConstants['main-font-regular'],
    fontSize: 14,
    marginTop: 5,
    color: color.neutral_dark,
  },
  wordBox: {
    width: styleConstants['content-width'] - 475,
    flexGrow: 1,
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 25,
    float: 'left',
    borderWidth: 1,
    borderColor: 'red',
  },
  wordBoxRTL: {
    marginLeft: 0,
    marginRight: 25,
  },
  actionBox: {
    float: 'right',
    display: 'flex',
  },
  inputBox: {
    float: 'left',
    marginTop: 27,
    borderRadius: 0,
    height: 26,
    paddingLeft: 25,
    width: 200,
  },
  button: {
    float: 'right',
    marginTop: 28,
    marginLeft: 20,
    marginRight: 25,
  },
  clear: {
    clear: 'both',
  },
};

export const UnconnectedJoinSection = JoinSection;

export default connect(state => ({
  isRtl: state.isRtl,
}))(JoinSection);
