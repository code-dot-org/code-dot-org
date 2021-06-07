/**
 * Loads an application from the API by a supplied applicationId and passes it to
 * the applicationData prop of the child component.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
  Panel,
  Table
} from 'react-bootstrap';
import parseJson from 'json-parse-better-errors';
import color from '@cdo/apps/util/color';

export default class FormDataEdit extends React.Component {
  static propTypes = {
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      course_name: PropTypes.string,
      application_type: PropTypes.oneOf(['Facilitator', 'Teacher']),
      form_data: PropTypes.object.isRequired
    }).isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      formData: JSON.stringify(this.props.applicationData.form_data, null, 2),
      parseError: null,
      saveErrors: null
    };
  }

  handleChange = event => {
    this.setState({formData: event.target.value});
  };

  handleReset = () => {
    this.setState(this.getInitialState());
  };

  handleSave = () => {
    let parsedFormData;
    try {
      parsedFormData = parseJson(this.state.formData);
      this.setState({parseError: null});
    } catch (error) {
      this.setState({parseError: error.message});
      return;
    }

    this.saveRequest = $.ajax({
      method: 'PATCH',
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        application: {
          form_data: parsedFormData
        }
      })
    })
      .done(() => {
        this.setState({saveErrors: null});
        this.context.router.push(`/${this.props.applicationId}`);
      })
      .fail(jqXHR => {
        if (jqXHR.status === 400) {
          const formDataErrors = jqXHR.responseJSON.errors
            .filter(e => e.startsWith('Form data '))
            .map(e => e.substring(10));

          this.setState({saveErrors: formDataErrors});
        }
      });
  };

  render() {
    const numLines = (this.state.formData.match(/\n/g) || []).length + 1;
    const validationState =
      this.state.parseError || this.state.saveErrors ? 'error' : null;

    return (
      <div>
        <Table>
          <tbody>
            <tr>
              <td>Id: </td>
              <td>{this.props.applicationId}</td>
            </tr>
            <tr>
              <td>Course: </td>
              <td>{this.props.applicationData.course_name}</td>
            </tr>
            <tr>
              <td>Type: </td>
              <td>{this.props.applicationData.application_type}</td>
            </tr>
          </tbody>
        </Table>

        <ButtonToolbar>
          <Button bsSize="small" onClick={this.handleReset}>
            Reset
          </Button>
          <Button bsSize="small" bsStyle="primary" onClick={this.handleSave}>
            Save
          </Button>
        </ButtonToolbar>

        {(this.state.parseError || this.state.saveErrors) && (
          <Panel style={styles.error}>
            <Panel.Heading>
              <Panel.Title>
                <div style={styles.error}>Error</div>
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              {this.state.parseError}

              {this.state.saveErrors && (
                <div>
                  Missing or invalid fields:
                  <ul>
                    {this.state.saveErrors.map(e => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Panel.Body>
          </Panel>
        )}

        <FormGroup controlId="form-data-edit" validationState={validationState}>
          <ControlLabel>Edit application form data JSON</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={this.state.formData}
            onChange={this.handleChange}
            rows={numLines}
          />
        </FormGroup>
      </div>
    );
  }
}

const styles = {
  error: {
    color: color.red
  }
};
