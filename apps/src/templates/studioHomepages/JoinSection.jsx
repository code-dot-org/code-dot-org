import $ from 'jquery';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from "@cdo/locale";
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    height: 72,
    width: 970,
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
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.2,
    marginTop: 16,
    backgroundColor: color.white,
    color: color.teal
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 12,
    lineHeight: 2.5,
    marginBottom: 16,
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
    marginLeft: 20,
    marginRight: 25
  },
};

const JoinSection = React.createClass({
  propTypes: {
    enrolledInASection: React.PropTypes.bool.isRequired,
  },

  joinSection() {
    const sectionCode = this.refs.sectionCode;

    $.post('/followers', {section_code: $(sectionCode).val()})
      .done(function () {
        window.location.reload(true);
      }.bind(this))
      .fail(function () {
      }.bind(this)
    );
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
        <input
          type="text"
          name="sectionCode"
          ref="sectionCode"
          style={styles.inputBox}
          placeholder={i18n.joinSectionPlaceholder()}
        />
        <ProgressButton
          onClick={this.joinSection}
          color={ProgressButton.ButtonColor.gray}
          text={i18n.joinSection()}
          style={styles.button}
        />
      </div>
    );
  }
});

export default JoinSection;
