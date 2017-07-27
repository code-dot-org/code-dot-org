import $ from 'jquery';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from "@cdo/locale";
import styleConstants from '../../styleConstants';
import Button from '@cdo/apps/templates/Button';

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    marginTop: 20,
    marginBottom: 20
  },
  mainDashed: {
    borderWidth: 5,
    borderStyle: 'dashed',
    borderColor: color.border_gray,
    boxSizing: "border-box"
  },
  heading: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.2,
    marginTop: 16,
    backgroundColor: color.white,
    color: color.teal
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    lineHeight: 2.5,
    marginBottom: 6,
    color: color.charcoal,
  },
  wordBox: {
    width: 500,
    marginLeft: 25,
    marginRight: 20,
    float: 'left',
    borderWidth: 1,
    borderColor: 'red'
  },
  actionBox: {
    float: 'right',
    // Right-align with buttons in SectionTable & courses Notification.
    marginRight: 21
  },
  inputBox: {
    float: 'left',
    marginTop: 15,
    borderRadius: 0,
    height: 26,
    paddingLeft: 25,
    width: 200
  },
  button: {
    float: 'left',
    marginTop: 15,
    marginLeft: 20
  },
  clear: {
    clear: 'both'
  }
};

const JoinSection = React.createClass({
  propTypes: {
    enrolledInASection: React.PropTypes.bool.isRequired,
    updateSections: React.PropTypes.func.isRequired,
    updateSectionsResult: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      sectionCode: ''
    };
  },

  handleChange(event) {
    this.setState({sectionCode: event.target.value});
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.joinSection();
    } else if (event.key === 'Escape') {
      this.setState(this.getInitialState());
    }
  },

  joinSection() {
    const sectionCode = this.state.sectionCode;

    this.setState(this.getInitialState());

    $.post({
      url: `/api/v1/sections/${sectionCode}/join`,
      dataType: "json"
    }).done(data => {
      const sectionName = data.sections.find(s => s.code === sectionCode.toUpperCase()).name;
      this.props.updateSections(data.sections);
      this.props.updateSectionsResult("join", data.result, sectionName);
    })
    .fail(data => {
      const result = (data.responseJSON && data.responseJSON.result) ? data.responseJSON.result : "fail";
      this.props.updateSectionsResult("join", result, sectionCode.toUpperCase());
    });
  },

  render() {
    const { enrolledInASection } = this.props;

    return (
      <div style={{...styles.main, ...(enrolledInASection ? styles.main : styles.mainDashed)}}>
        <div style={styles.wordBox}>
          <div style={styles.heading}>
            {i18n.joinASection()}
          </div>
          <div style={styles.details}>
            {i18n.joinSectionDescription()}
          </div>
        </div>
        <div style={styles.actionBox}>
          <input
            type="text"
            name="sectionCode"
            value={this.state.sectionCode}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            style={styles.inputBox}
            placeholder={i18n.joinSectionPlaceholder()}
          />
          <Button
            onClick={this.joinSection}
            color={Button.ButtonColor.gray}
            text={i18n.joinSection()}
            style={styles.button}
          />
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
});

export default JoinSection;
