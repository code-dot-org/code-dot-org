import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

export default class PhotoRelease extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Photo Release</h4>
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
        {this.buildButtonsFromOptions({
          name: 'photoRelease',
          label: "I agree",
          type: 'radio',
        })}
      </FormGroup>
    );
  }
}

PhotoRelease.associatedFields = [
  "photoRelease",
];
