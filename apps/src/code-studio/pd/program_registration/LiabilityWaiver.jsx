import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

export default class LiabilityWaiver extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Liability Waiver</h4>
        <p>
          <em>
            I understand that by registering for and attending a
            Code.org-sponsored professional learning event, including but not
            limited to Facilitation Training Events and TeacherCon, I am
            agreeing to the terms of this Waiver & Release of Liability. &nbsp;
          </em>
          All attendees are asked to agree to this form before completing
          registration for this event.
        </p>
        <p>
          I will indemnify and hold harmless Code.org, its officers,
          directors, employees, partners, contractors, customers, and agents
          from any and all claims, losses, liabilities, damages, expenses and
          costs (including attorneys fees and court costs) resulting from
          judgments or claims for personal injury, including death, and
          property damage against them arising out of my traveling to,
          participating in, or returning from any Code.org professional
          learning event, but excluding liability for injury, death, or damage
          caused solely by gross negligence of Code.org.
        </p>
        <p>
          I agree to provide an emergency contact before attending any
          Code.org professional learning event. I grant my authorization and
          consent for trained personnel to administer general first aid
          treatment for minor injuries or illnesses. If the injury or illness
          is severe, I authorize him or her to seek professional emergency
          personnel to attend, transport, and treat me and to issue consent
          for any medical care deemed advisable by a licensed medical
          professional or institution. I authorize the designated personnel to
          exercise best judgment upon the advice of medical or emergency
          personnel, if my emergency contact is not reachable.
        </p>
        <p>
          I take full personal responsibility for all charges and damages to
          my hotel room caused by me or any of my guests. I also declare that
          I will adhere to applicable local, state, and federal laws, and any
          other pertinent laws or regulations in force at the conference
          location.
        </p>
        <p>
          I have carefully read, clearly understood and accepted the terms and
          conditions stated herein and acknowledge that this agreement shall
          be effective and binding for all future Code.org professional
          learning events after checking YES below.
        </p>
        {this.buildButtonsFromOptions({
          name: 'liabilityWaiver',
          label: "I agree",
          type: 'check'
        })}
      </FormGroup>
    );
  }
}

LiabilityWaiver.associatedFields = [
  "liabilityWaiver",
];
