/*
 * Form to create a workshop enrollment
 */
import React from 'react';

export default class EnrollForm extends React.Component {
  render() {
    return (
      <p>
        Fields marked with a<span className="form-required-field"> * </span>
        are required.
      </p>
    );
  }
}
