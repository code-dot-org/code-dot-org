import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import {styles as censusFormStyles} from '@cdo/apps/templates/census2017/censusFormStyles';
import SafeMarkdown from '../../../../templates/SafeMarkdown';

const eligibilitySchoolUnknown = `
Because your school isn’t listed, we were not able to look up the data on what percent of your
students are eligible for free/reduced-price lunches. If you participated in the 2019-20 CS
Discoveries Professional Learning Program and believe you meet the requirements to qualify for a
subsidy, please contact [teacher@code.org](mailto:teacher@code.org) to continue.
Otherwise, you are still eligible for a discount!
Adafruit has made available a 10% off educator discount that this kit is eligible for.
Just use the code \`ADAEDU\` at checkout.
`;

export default class DiscountCodeSchoolChoice extends Component {
  static propTypes = {
    initialSchoolId: PropTypes.string,
    initialSchoolName: PropTypes.string,
    schoolConfirmed: PropTypes.bool.isRequired,
    onSchoolConfirmed: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      confirming: false,
      confirmed: props.schoolConfirmed,
      schoolId: props.initialSchoolId,
      schoolName: props.initialSchoolName,
      errorText: ''
    };
  }

  handleDropdownChange = (field, event) => {
    if (field === 'nces') {
      this.setState({
        schoolId: event ? event.value : '',
        schoolName: event ? event.label : ''
      });
    }
  };

  handleClickConfirmSchool = () => {
    this.setState({
      confirming: true
    });

    $.ajax({
      url: '/maker/schoolchoice',
      type: 'post',
      dataType: 'json',
      data: {
        nces: this.state.schoolId
      }
    })
      .done(data => {
        this.props.onSchoolConfirmed({
          schoolId: this.state.schoolId,
          schoolHighNeedsEligible: data.school_high_needs_eligible
        });
        this.setState({
          confirming: false,
          confirmed: true,
          errorText: ''
        });
      })
      .fail((jqXHR, textStatus) => {
        console.error(textStatus);
        this.setState({
          confirming: false,
          confirmed: false,
          errorText:
            "We're sorry, but something went wrong. Try refreshing the page " +
            'and submitting again.  If this does not work, please contact support@code.org.'
        });
      });
  };

  render() {
    const {schoolId, schoolName, confirming, confirmed} = this.state;

    if (confirmed) {
      return (
        <div style={styles.confirmed}>
          <div style={censusFormStyles.question}>{i18n.schoolName()}</div>
          {schoolName}
        </div>
      );
    }

    return (
      <div>
        <SchoolAutocompleteDropdownWithLabel
          setField={this.handleDropdownChange}
          value={schoolId}
          showErrorMsg={false}
        />
        {this.state.schoolId !== '-1' && (
          <Button
            __useDeprecatedTag
            color={Button.ButtonColor.orange}
            text={confirming ? i18n.confirming() : i18n.confirmSchool()}
            onClick={this.handleClickConfirmSchool}
            style={styles.button}
            disabled={confirming || !this.state.schoolId}
          />
        )}
        {this.state.schoolId === '-1' && (
          <div>
            <SafeMarkdown markdown={eligibilitySchoolUnknown} />
          </div>
        )}
        {this.state.errorText && (
          <div style={styles.errorText}>{this.state.errorText}</div>
        )}
      </div>
    );
  }
}

const styles = {
  confirmed: {
    marginBottom: 5
  },
  button: {
    marginTop: 10
  },
  errorText: {
    color: 'red'
  }
};
