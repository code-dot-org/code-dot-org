import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';

import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import color from '@cdo/apps/util/color';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

import LessonEditorDialog from './LessonEditorDialog';

const TYPE_OPTIONS = [
  'Activity Guide',
  'Answer Key',
  'Exemplar',
  'Handout',
  'Resource',
  'Rubric',
  'Slides',
  'Video'
];

const AUDIENCE_OPTIONS = ['Student', 'Teacher', 'Verified Teacher'];

const initialState = {
  name: '',
  type: '',
  audience: '',
  includeInPdf: false,
  assessment: false,
  url: '',
  downloadUrl: '',
  error: ''
};

export default class AddResourceDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onSave: PropTypes.func,
    handleClose: PropTypes.func.isRequired,
    existingResource: resourceShape,
    courseVersionId: PropTypes.number
  };

  constructor(props) {
    super(props);

    if (props.existingResource) {
      this.state = {
        name: props.existingResource.name,
        type: props.existingResource.type,
        audience: props.existingResource.audience,
        includeInPdf: props.existingResource.includeInPdf,
        assessment: props.existingResource.assessment,
        url: props.existingResource.url,
        downloadUrl: props.existingResource.downloadUrl,
        error: ''
      };
    } else {
      this.state = {...initialState};
    }
  }

  validateResource = () => {
    const {name, url} = this.state;
    let error = '';
    if (name === '') {
      error += 'Name is required. ';
    }
    if (url === '') {
      error += 'URL is required.';
    }
    this.setState({error});
    if (error === '') {
      return true;
    } else {
      return false;
    }
  };

  resetState = () => {
    this.setState(initialState);
  };

  saveResource = e => {
    // Stop the page from reloading after form submit
    e.preventDefault();
    if (this.validateResource()) {
      const formData = new FormData(e.target);
      const method = this.props.existingResource ? 'PATCH' : 'POST';
      const url = this.props.existingResource
        ? `/resources/${this.props.existingResource.id}`
        : '/resources';
      fetch(url, {
        method,
        headers: {'X-CSRF-Token': formData.get('authenticity_token')},
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            this.setState({error: response.statusText});
          }
          return response;
        })
        .then(response => (response.ok ? response.json() : {}))
        .then(json => {
          if (!_.isEmpty(json)) {
            this.resetState();
            if (this.props.onSave) {
              this.props.onSave(json);
            }
            this.props.handleClose();
          }
        });
    }
  };

  handleInputChange = e => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({[target.name]: value});
  };

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h2>
          {this.props.existingResource ? 'Edit Resource' : 'Add Resource'}
        </h2>
        {this.state.error !== '' && (
          <h3 style={{color: 'red'}}>{this.state.error}</h3>
        )}
        <form id="create-resource-form" onSubmit={this.saveResource}>
          <RailsAuthenticityToken />
          {this.props.courseVersionId && (
            <input
              type="hidden"
              name="courseVersionId"
              value={this.props.courseVersionId}
            />
          )}
          <div style={styles.container}>
            <label style={styles.inputAndLabel}>
              Resource Name *
              <input
                style={styles.textInput}
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleInputChange}
              />
            </label>
            <div style={styles.dropdownRow}>
              <label style={styles.selectAndLabel}>
                <span>Type:</span>
                <select
                  style={styles.selectInput}
                  onChange={this.handleInputChange}
                  name="type"
                  value={this.state.type}
                >
                  <option value={''}>{''}</option>
                  {TYPE_OPTIONS.map(option => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.selectAndLabel}>
                Audience
                <select
                  style={styles.selectInput}
                  name="audience"
                  value={this.state.audience}
                  onChange={this.handleInputChange}
                >
                  <option value={''}>{''}</option>
                  {AUDIENCE_OPTIONS.map(option => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{display: 'flex'}}>
              <label>
                Assessment
                <input
                  type="checkbox"
                  style={styles.checkboxInput}
                  name="assessment"
                  value={this.state.assessment}
                  checked={this.state.assessment}
                  onChange={this.handleInputChange}
                />
              </label>
              <label style={{marginLeft: 20}}>
                Include in PDF
                <input
                  type="checkbox"
                  style={styles.checkboxInput}
                  name="includeInPdf"
                  value={this.state.includeInPdf}
                  checked={this.state.includeInPdf}
                  onChange={this.handleInputChange}
                />
              </label>
            </div>
            <label style={styles.inputAndLabel}>
              URL *
              <input
                style={styles.textInput}
                type="text"
                value={this.state.url}
                name="url"
                onChange={this.handleInputChange}
              />
            </label>
            <label style={styles.inputAndLabel}>
              Download URL
              <input
                style={styles.textInput}
                type="text"
                name="downloadUrl"
                value={this.state.downloadUrl}
                onChange={this.handleInputChange}
              />
            </label>
          </div>
          <DialogFooter rightAlign>
            <input
              id="submit-button"
              type="submit"
              value="Close and Save"
              style={styles.submitButton}
            />
          </DialogFooter>
        </form>
      </LessonEditorDialog>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputAndLabel: {
    display: 'flex',
    flexDirection: 'column'
  },
  textInput: {
    width: '98%'
  },
  selectAndLabel: {
    display: 'flex',
    flexDirection: 'column',
    width: '45%'
  },
  selectInput: {
    width: '100%'
  },
  checkboxInput: {
    marginTop: 0,
    marginLeft: 10
  },
  submitButton: {
    color: 'white',
    backgroundColor: color.orange,
    borderColor: color.orange,
    borderRadius: 3,
    fontSize: 12,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5
  }
};
