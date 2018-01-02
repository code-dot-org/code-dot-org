import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import Button from "@cdo/apps/templates/Button";
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';

const styles = {
  unit6Form: {
    marginTop: 15
  },
  question: {
    marginBottom: 5,
    // bolder
    fontFamily: '"Gotham 7r", sans-serif',
  },
  radio: {
    margin: '0px 10px'
  },
  submit: {
    marginTop: 5
  },
  errorText: {
    color: 'red',
  },
};

export default class Unit6ValidationStep extends Component {
  static propTypes = {
    showRadioButtons: PropTypes.bool.isRequired,
    stepStatus: PropTypes.oneOf(Object.values(Status)).isRequired,
    initialChoice: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      choice: props.initialChoice,
      submitting: false,
    };
  }

  handleChangeIntention = event => {
    this.setState({choice: event.target.value});
  }

  handleSubmit = () => {
    this.setState({submitting: true});
    $.ajax({
     url: "/maker/apply",
     type: "post",
     dataType: "json",
     data: {
       unit_6_intention: this.state.choice
     }
   }).done(data => {
     this.props.onSubmit(data.eligible);
     this.setState({
       submitting: false,
       errorText: ''
     });
   }).fail((jqXHR, textStatus) => {
     console.error(textStatus);
     this.setState({
       submitting: false,
       errorText: "We're sorry, but something went wrong. Try refreshing the page " +
        "and submitting again.  If this does not work, please contact support@code.org."
      });
   });
  }

  render() {
    const { showRadioButtons, stepStatus } = this.props;
    const { errorText } = this.state;
    return (
      <ValidationStep
        stepName={i18n.eligibilityReqYear()}
        stepStatus={stepStatus}
        alwaysShowChildren={true}
      >
        {showRadioButtons &&
          <div>
            {i18n.eligibilityReqYearFail()}
            <form style={styles.unit6Form}>
              <strong style={styles.question}>
                {i18n.eligibilityReqYearConfirmInstructions()}
              </strong>
              {[
                ['no', i18n.eligibilityYearNo()],
                ['yes1718', i18n.eligibilityYearYes1718()],
                ['yes1819', i18n.eligibilityYearYes1819()],
                ['yesAfter', i18n.eligibilityYearAfter()],
                ['unsure', i18n.eligibilityYearUnknown()],
              ].map(([value, description]) =>
                <label key={value}>
                  <input
                    style={styles.radio}
                    type="radio"
                    name="year"
                    value={value}
                    checked={this.state.choice === value}
                    onChange={this.handleChangeIntention}
                    disabled={stepStatus !== Status.UNKNOWN}
                  />
                {description}
                </label>
              )}
              {/* Remove button after choice is made */}
              {stepStatus === Status.UNKNOWN &&
                <Button
                  style={styles.submit}
                  color={Button.ButtonColor.orange}
                  text={this.state.submitting ? i18n.submitting() : i18n.submit()}
                  onClick={this.handleSubmit}
                  disabled={this.state.submitting || this.props.disabled}
                />
              }
              {errorText &&
                <div style={styles.errorText}>{errorText}</div>
              }
            </form>
          </div>
        }
        {stepStatus === Status.FAILED &&
          <div>{i18n.eligibilityYearDecline()}</div>
        }
      </ValidationStep>
    );
  }
}
