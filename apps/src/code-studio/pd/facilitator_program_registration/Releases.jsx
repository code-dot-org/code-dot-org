import React from 'react';
import {FormGroup} from 'react-bootstrap';
import ProgramRegistrationComponent from './ProgramRegistrationComponent';
import Demographics from './Demographics';

export default class Releases extends ProgramRegistrationComponent {
  render() {
    return (
      <FormGroup>
        <FormGroup>
          <h4>Part 2 of 4: Photo Release</h4>
          <p>
            Photos from Code.org workshops are commonly posted to social media
            by other workshop attendees, by workshop facilitators, or even
            sometimes by Code.org. If you're okay with having your photo taken
            and shared in this way, please check "YES" in the box below.
          </p>
          <p>
            If you do not wish to have your photo taken, it is your
            responsibility to communicate this to your workshop facilitator in
            advance.
          </p>
          <p>
            By checking "YES" below, I grant Code.org, its representatives and
            employees the right to take photographs of me and my personal
            property during the duration of this and any future professional
            development workshops provided by Code.org, for the sole purpose of
            posting to social media and other similar digital marketing. I
            further acknowledge that participation is voluntary and that neither
            I or nor Code.org will receive financial compensation of any type
            associated with the publication of these photographs, and that
            publication of said photos confers no rights of ownership or
            royalties whatsoever. I hereby release Code.org, its contractors,
            its employees and any third parties involved in the creation or
            publication of Code.org digital marketing, from liability for any
            claims by me or any third party in connection with my participation.
          </p>
          {this.buildButtonsFromOptions(
            'photoRelease',
            "I agree",
            'check'
          )}
        </FormGroup>
        <FormGroup>
          <h4>Part 3 of 4: Liability Waiver</h4>
          <p>
            <em>
              I understand that by registering for and attending a
              Code.org-sponsored professional learning event, including but not
              limited to Facilitation Training Events and TeacherCon, I am
              agreeing to the terms of this Waiver & Release of Liability.
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
          {this.buildButtonsFromOptions(
            'liabilityWaiver',
            "I agree",
            'check'
          )}
        </FormGroup>
        <Demographics
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.props.errors}
        />
      </FormGroup>
    );
  }
}
