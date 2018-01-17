import $ from 'jquery';
import React, {PropTypes} from 'react';
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
    marginTop: 25
  },
  mainDashed: {
    borderWidth: 5,
    borderStyle: 'dashed',
    borderColor: color.border_gray,
    boxSizing: "border-box"
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
    color: color.charcoal,
  },
  wordBox: {
    width: styleConstants['content-width']-475,
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 25,
    float: 'left',
    borderWidth: 1,
    borderColor: 'red'
  },
  actionBox: {
    float: 'right',
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

const INITIAL_STATE = {
  sectionCode: ''
};

export default class JoinSection extends React.Component {
  static propTypes = {
    enrolledInASection: PropTypes.bool.isRequired,
    updateSections: PropTypes.func.isRequired,
    updateSectionsResult: PropTypes.func.isRequired
  };

  state = {...INITIAL_STATE};

  handleChange = (event) => this.setState({sectionCode: event.target.value});

  handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.joinSection();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  joinSection = () => {
    const sectionCode = this.state.sectionCode;

    this.setState(INITIAL_STATE);

    $.post({
      url: `/api/v1/sections/${sectionCode}/join`,
      dataType: "json"
    }).done(data => {
      const sectionName = data.sections.find(s => s.code === sectionCode.toUpperCase()).name;
      this.props.updateSections(data.sections);
      this.props.updateSectionsResult("join", data.result, sectionName, sectionCode);
    })
    .fail(data => {
      const result = (data.responseJSON && data.responseJSON.result) ? data.responseJSON.result : "fail";
      this.props.updateSectionsResult("join", result, null, sectionCode.toUpperCase());
    });
  };

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
}
