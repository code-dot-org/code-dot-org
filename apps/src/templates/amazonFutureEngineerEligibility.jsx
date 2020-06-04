import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../code-studio/pd/form_components/FieldGroup';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import color from '@cdo/apps/util/color';

const styles = {
  error: {
    color: color.red
  },
  miniContactContainer: {
    backgroundColor: color.lightest_cyan,
    padding: 20,
    borderRadius: 10,
    textAlign: 'left'
  },
  modalHeader: {
    padding: '0 15px 0 0',
    height: 30,
    borderBottom: 'none'
  },
  modalBody: {
    padding: '0 15px 15px 15px',
    fontSize: 14,
    lineHeight: '22px'
  },
  intro: {
    paddingBottom: 10
  },
  select: {
    maxWidth: 500
  }
};

export class AmazonFutureEngineerEligibility extends React.Component {
  // Update options to only be email and school
  static propTypes = {
    options: PropTypes.shape({
      email: PropTypes.string,
      zip: PropTypes.string,
      notes: PropTypes.string,
      grade_levels: PropTypes.array,
      role: PropTypes.string
    }),
    apiEndpoint: PropTypes.string.isRequired,
    sourcePageId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      schoolEligible: null,
      consent: false,
      submitting: false,
      submitted: false,
      errors: [],
      email: this.props.options.email,
      zip: this.props.options.zip,
      notes: this.props.options.notes,
      role: this.props.options.role,
      grade_levels: this.props.options.grade_levels
    };
  }

  // Make this a real handleChange
  handleChange = change => {
    this.setState(change);
  };

  // make this a real submit
  submit = () => {
    // const params = {
    // get real params
    // };

    // use (or remove) submitting state
    this.setState({
      submitting: true,
      schoolEligible: true
    });

    // do something when submitting
  };

  handleConsent = () => {
    this.setState({
      consent: true
    });
  };

  handleDropdownChange = (field, event) => {
    if (field === 'nces') {
      this.setState({
        schoolId: event ? event.value : '',
        schoolName: event ? event.label : ''
      });
    }
  };

  render() {
    // update ID and classname appropriately
    // should separate this little form group out into its own component (like DiscountCodeSchoolChoice)
    return (
      <div>
        {this.state.schoolEligible === null && (
          <div>
            <h2>Am I eligible?</h2>
            <FormGroup
              id={`regional-partner-mini-contact-form-${
                this.props.sourcePageId
              }`}
              className="regional-partner-mini-contact-form"
            >
              <div style={styles.intro}>
                Enter your teacher email address and select your school below to
                find out if you're eligible to participate in the Amazon Future
                Engineer program, which offers free support for participating
                Code.org classrooms.
              </div>
              <FieldGroup
                id="email"
                label="Email"
                type="text"
                required={false}
                onChange={this.handleChange}
                defaultValue={this.state.name}
              />
              <SchoolAutocompleteDropdownWithLabel
                setField={this.handleDropdownChange}
                fieldName="school"
                showRequiredIndicator={true}
              />
              <Button id="submit" onClick={this.submit}>
                Send
              </Button>
            </FormGroup>
          </div>
        )}
        {this.state.schoolEligible !== null && this.state.consent === false && (
          <AmazonFutureEngineerForm
            email="ben@code.org"
            schoolId="-1"
            onClick={this.handleConsent}
          />
        )}
        {this.state.schoolEligible !== null && this.state.consent === true && (
          <AmazonFutureEngineerAccountConfirmation />
        )}
      </div>
    );
  }
}

export class AmazonFutureEngineerForm extends React.Component {
  static propTypes = {
    email: PropTypes.string,
    schoolId: PropTypes.string,
    onClick: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      email: this.props.email
    };
  }

  // make this a real submit
  submit = () => {
    // use (or remove) submitting state
    this.setState({
      submitting: true,
      schoolEligible: true
    });

    // do something when submitting
  };

  // need to control values with react
  // add checkbox saying "you teach at eligible school" at top
  render() {
    return (
      <div>
        <div>
          <div>
            <ValidationStep
              stepStatus={Status.SUCCEEDED}
              stepName="You teach at an eligible school!"
            />
            We invite you to enroll in the Amazon Future Engineer program by
            completing the information below.
          </div>
          <form>
            <label htmlFor="email">Email:</label>
            <input id="email" type="text" />
            <br />

            <label htmlFor="first_name">First name:</label>
            <input type="text" id="first_name" />
            <br />
            <label htmlFor="last_name">Last name:</label>
            <input type="text" id="last_name" />
            <br />
            <div>
              How can Amazon Future Engineer help you grow computer science at
              your school?
            </div>
            <hr />
            <input type="checkbox" id="inspiration_kit" />
            <label htmlFor="inspiration_kit">
              Send my school an Inspiration Kit with posters and stickers to
              help promote computer science to students and parents.
            </label>
            <br />
            <input type="checkbox" id="csta" />
            <label htmlFor="csta">
              Send me a free annual Computer Science Teachers Association (CSTA)
              Plus membership - which includes access to Amazon expert-led
              webinars and other exclusive content.
            </label>
            <br />
            <input type="checkbox" id="aws_educate" />
            <label htmlFor="aws_educate">
              Send me a free membership to Amazon Web Services Educate to access
              free content and cloud computing credits to help my students learn
              to build in the cloud.
            </label>
            <br />
            <hr />
            <input type="checkbox" id="consent" />
            <label htmlFor="consent">
              I give Code.org permission to share my name, email address, and
              school name, address, and ID with Amazon.com (required to
              participate). Use of your personal information is subject to
              Amazon’s Privacy Policy.
            </label>
            <br />
            <div>
              By clicking Continue, you will receive an email from Amazon Future
              Engineer to claim your benefits. You will also receive occasional
              emails from Amazon Future Engineer about new opportunities. You
              always have the choice to adjust your interest settings or
              unsubscribe.
            </div>
            <Button id="submit" onClick={this.props.onClick}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

export class AmazonFutureEngineerAccountConfirmation extends React.Component {
  render() {
    return (
      <div>
        <Button id="sign_up" onClick={() => {}}>
          Sign up
        </Button>
      </div>
    );
  }
}
