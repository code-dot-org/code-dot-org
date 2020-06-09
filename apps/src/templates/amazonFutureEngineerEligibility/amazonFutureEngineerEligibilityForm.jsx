import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';
import _ from 'lodash';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SingleCheckbox from '../../code-studio/pd/form_components/SingleCheckbox';

export default class AmazonFutureEngineerEligibilityForm extends React.Component {
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
          id="street1"
          label="Street 1"
          type="text"
          required={true}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="street2"
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
