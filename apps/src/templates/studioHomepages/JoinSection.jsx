import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';
import Button from '@cdo/apps/templates/Button';
import {connect} from 'react-redux';

const INITIAL_STATE = {
  sectionCode: ''
};

class JoinSection extends React.Component {
  static propTypes = {
    enrolledInASection: PropTypes.bool.isRequired,
    updateSections: PropTypes.func.isRequired,
    updateSectionsResult: PropTypes.func.isRequired,

    // Provided by Redux
    isRtl: PropTypes.bool
  };

  state = {...INITIAL_STATE};

  fetchCaptchaInfo = () => {
    $.get({
      url: '/api/v1/sections/require_captcha',
      dataType: 'json'
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
      dataType: 'json'
    })
      .done(data => {
        const sectionName = data.sections.find(
          s => s.code === normalizedSectionCode
        ).name;
        this.props.updateSections(data.sections);
        this.props.updateSectionsResult(
          'join',
          data.result,
          sectionName,
          sectionCode
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
          ...(enrolledInASection ? styles.main : styles.mainDashed)
        }}
      >
        <div style={wordBoxStyle}>
          <div style={styles.heading}>{i18n.joinASection()}</div>
          <div style={styles.details}>{i18n.joinSectionDescription()}</div>
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
            __useDeprecatedTag
            onClick={this.joinSection}
            className="ui-test-join-section"
            color={Button.ButtonColor.gray}
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
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    marginTop: 25
  },
  mainDashed: {
    borderWidth: 5,
    borderStyle: 'dashed',
    borderColor: color.border_gray,
    boxSizing: 'border-box'
  },
  heading: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: color.white,
    color: color.teal
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    marginTop: 5,
    color: color.charcoal
  },
  wordBox: {
    width: styleConstants['content-width'] - 475,
    flexGrow: 1,
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 25,
    float: 'left',
    borderWidth: 1,
    borderColor: 'red'
  },
  wordBoxRTL: {
    marginLeft: 0,
    marginRight: 25
  },
  actionBox: {
    float: 'right',
    display: 'flex'
  },
  inputBox: {
    float: 'left',
    marginTop: 27,
    borderRadius: 0,
    height: 26,
    paddingLeft: 25,
    width: 200
  },
  button: {
    float: 'right',
    marginTop: 28,
    marginLeft: 20,
    marginRight: 25
  },
  clear: {
    clear: 'both'
  }
};

export const UnconnectedJoinSection = JoinSection;

export default connect(state => ({
  isRtl: state.isRtl
}))(JoinSection);
