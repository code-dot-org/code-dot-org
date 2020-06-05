import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../code-studio/pd/form_components/FieldGroup';
import SingleCheckbox from '../code-studio/pd/form_components/SingleCheckbox';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';

const styles = {
  intro: {
    paddingBottom: 10
  }
};

export class AmazonFutureEngineerEligibility extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schoolEligible: null,
      consent: false,
      email: ''
    };
  }

  handleChange = change => {
    this.setState(change);
  };

  submit = () => {
    // TO DO: actually check whether a school is eligible
    // TO DO: if ineligible, open new ineligibility page (markdown that marketing can edit)
    this.setState({
      schoolEligible: true
    });
  };

  handleSchoolDropdownChange = (field, event) => {
    this.setState({
      schoolId: event ? event.value : '',
      schoolName: event ? event.label : ''
    });
  };

  render() {
    // TO DO: figure out how FormGroup id/className were used in regional partner mini contact
    return (
      <div>
        {this.state.schoolEligible === null && (
          <div>
            <h2>Am I eligible?</h2>
            <FormGroup id="amazon-future-engineer-eligiblity-intro">
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
              />
              <SchoolAutocompleteDropdownWithLabel
                setField={this.handleSchoolDropdownChange}
                showRequiredIndicator={true}
                value={this.state.schoolId}
              />
              <Button id="submit" onClick={this.submit}>
                Find out if I'm eligible
              </Button>
            </FormGroup>
          </div>
        )}
        {this.state.schoolEligible === true && this.state.consent === false && (
          <AmazonFutureEngineerForm
            email={this.state.email}
            schoolId={this.state.schoolId}
            onContinue={this.handleChange}
          />
        )}
        {this.state.schoolEligible !== null && this.state.consent === true && (
          <AmazonFutureEngineerAccountConfirmation />
        )}
      </div>
    );
  }
}

class AmazonFutureEngineerForm extends React.Component {
  static propTypes = {
    email: PropTypes.string,
    schoolId: PropTypes.string,
    onContinue: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      email: this.props.email,
      inspirationKit: false,
      csta: false,
      awsEducate: false,
      consent: false
    };
  }

  handleChange = change => {
    this.setState(change);
  };

  submit = () => {
    const stateChange = _.pick(this.state, [
      'firstName',
      'lastName',
      'inspirationKit',
      'csta',
      'awsEducate',
      'consent',
      'street1',
      'street2',
      'city',
      'state',
      'zip'
    ]);

    this.props.onContinue(stateChange);
  };

  render() {
    // TO DO: gray out school dropdown and disable editing
    // TO DO: Add "Not your school? go back" link below school dropdown
    // TO DO: Enforce that these required fields are actually required
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
            <FieldGroup
              id="email"
              label="Email"
              type="text"
              required={true}
              onChange={this.handleChange}
              defaultValue={this.props.email}
            />
            <SchoolAutocompleteDropdownWithLabel
              setField={this.handleDropdownChange}
              showRequiredIndicator={true}
              value={this.props.schoolId}
            />
            <FieldGroup
              id="firstName"
              label="First name"
              type="text"
              required={true}
              onChange={this.handleChange}
            />
            <FieldGroup
              id="lastName"
              label="Last name"
              type="text"
              required={true}
              onChange={this.handleChange}
            />
            <div>
              How can Amazon Future Engineer help you grow computer science at
              your school?
            </div>
            <hr />
            <SingleCheckbox
              name="inspirationKit"
              label="Send my school an Inspiration Kit with posters and stickers to
              help promote computer science to students and parents."
              onChange={this.handleChange}
              value={this.state.inspirationKit}
            />
            {this.state.inspirationKit && (
              <ShippingAddressFormGroup handleChange={this.handleChange} />
            )}
            <SingleCheckbox
              name="csta"
              label="Send me a free annual Computer Science Teachers Association (CSTA)
              Plus membership - which includes access to Amazon expert-led
              webinars and other exclusive content."
              onChange={this.handleChange}
              value={this.state.csta}
            />
            <SingleCheckbox
              name="awsEducate"
              label="Send me a free membership to Amazon Web Services Educate to access
              free content and cloud computing credits to help my students learn
              to build in the cloud."
              onChange={this.handleChange}
              value={this.state.awsEducate}
            />
            <hr />
            <SingleCheckbox
              name="consent"
              label="I give Code.org permission to share my name, email address, and
              school name, address, and ID with Amazon.com (required to
              participate). Use of your personal information is subject to
              Amazon’s Privacy Policy."
              onChange={this.handleChange}
              value={this.state.consent}
              required={true}
            />
            <div>
              By clicking Continue, you will receive an email from Amazon Future
              Engineer to claim your benefits. You will also receive occasional
              emails from Amazon Future Engineer about new opportunities. You
              always have the choice to adjust your interest settings or
              unsubscribe.
            </div>
            <Button id="continue" onClick={this.submit}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

class AmazonFutureEngineerAccountConfirmation extends React.Component {
  render() {
    // TO DO: Add links to account sign up page.
    // TO DO: Need to put submission data
    //  (currently kept in state of AmazonFutureEngineerEligibility component)
    //  somewhere (session cookie?) that will persist while they sign up or sign in,
    // at which point we'll send an API request to Amazon's Pardot API endpoint.
    return (
      <div>
        <h2>Almost done!</h2>
        <div>
          Thank you for completing your application information for the Amazon
          Future Engineer program. To finalize your participation and start
          receiving benefits, sign up for a Code.org account, or sign in if you
          already have one.
        </div>
        <div>Already have a Code.org account? Sign in.</div>
        <Button id="sign_up" onClick={() => {}}>
          Sign up
        </Button>
      </div>
    );
  }
}

// This might be better as pure functional component?
// Just takes handleChange as argument, returns form?
class ShippingAddressFormGroup extends React.Component {
  static propTypes = {
    handleChange: PropTypes.func.isRequired
  };

  handleChange = change => {
    this.props.handleChange(change);
  };

  render() {
    // TO DO: Maybe outermost element should be FormGroup, not div
    return (
      <div>
        <div>
          Since you checked the box above, please verify your school address
          below.
        </div>
        <FieldGroup
          id="street_1"
          label="Street 1"
          type="text"
          required={true}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="street_2"
          label="Street 2"
          type="text"
          required={false}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="city"
          label="City"
          type="text"
          required={true}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="state"
          label="State"
          type="text"
          required={true}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="zip"
          label="Zip code"
          type="number"
          required={true}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
