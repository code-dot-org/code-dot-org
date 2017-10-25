import React, {PropTypes} from 'react';
import {Button, FormControl, Panel} from 'react-bootstrap';
import Facilitator1819Questions from './detail_view_facilitator_specific_components';
import $ from 'jquery';
import _ from 'lodash';

// Public function to render a question/answer pair as either a line item or a panel
// depending on whether the question will be assigned score
const renderItem = (key, value, layout, iteratorKey) => {
  if (typeof value === 'string' || typeof value === 'object') {
    let renderedValue = value;
    if (Array.isArray(value)) {
      renderedValue = _.join(value, ', ');
    }

    if (layout === 'lineItem') {
      return renderLineItem(key, renderedValue, iteratorKey);
    } else {
      return renderQuestionBox(key, renderedValue, iteratorKey);
    }
  }
};

const renderLineItem = (key, value, iteratorKey) => {
  // If there is a value to this line item, render the question. Then optionally
  // render a : if the question does not end in ?, :, or . Then render the answer.
  return value && (
      <div key={iteratorKey}>
        <span style={{fontFamily: '"Gotham 7r"', marginRight: '10px'}}>
          {`${key}${'?:.'.indexOf(key[key.length - 1]) >= 0 ? '' : ':'}`}
        </span>
        {value}
      </div>
    );
};

const renderQuestionBox = (key, value, iteratorKey) => {
  return value && (
    <Panel key={iteratorKey} header={key} style={{display: 'table'}}>
      {value}
    </Panel>
  );
};

class DetailViewContents extends React.Component {
  static propTypes = {
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      regional_partner_name: PropTypes.string,
      notes: PropTypes.string,
      status: PropTypes.string.isRequired,
      school_name: PropTypes.string,
      district_name: PropTypes.string,
      email: PropTypes.string,
      formData: PropTypes.object
    }),
  }

  state = {
    status: this.props.applicationData.status,
    notes: this.props.applicationData.notes
  }

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      status: this.props.applicationData.status
    });
  }

  handleEditClick = () => {
    this.setState({
      editing: true
    });
  }

  handleStatusChange = (event) => {
    this.setState({
      status: event.target.value
    });
  }

  handleNotesChange = (event) => {
    this.setState({
      notes: event.target.value
    });
  }

  handleSaveClick = () => {
    $.ajax({
      method: "PATCH",
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(this.state)
    }).done(() => {
      this.setState({
        editing: false
      });
    });
  }

  renderEditButtons = () => {
    if (this.state.editing) {
      return [(
        <Button bsStyle="primary">
          Save
        </Button>
      ), (
        <Button onClick={this.handleCancelEditClick}>
          Cancel
        </Button>
      )
      ];
    } else {
      return (
        <Button onClick={this.handleEditClick}>
          Edit
        </Button>
      );
    }
  }

  renderHeader = () => {
    return (
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <h1>
          {`${this.props.applicationData.formData.firstName} ${this.props.applicationData.formData.lastName}`}
        </h1>

        <div id="DetailViewHeader" style={{display: 'flex', marginLeft: 'auto'}}>
          <FormControl
            componentClass="select"
            disabled={!this.state.editing}
            value={this.state.status}
            onChange={this.handleStatusChange}
          >
            <option value="unreviewed">
              Unreviewed
            </option>
            <option value="accepted">
              Accepted
            </option>
            <option value="declined">
              Declined
            </option>
          </FormControl>
          {
            this.state.editing ? [(
              <Button onClick={this.handleSaveClick} bsStyle="primary" key="save">
                Save
              </Button>
            ), (
              <Button onClick={this.handleCancelEditClick} key="cancel">
                Cancel
              </Button>
            )
            ] : (
              <Button onClick={this.handleEditClick}>
                Edit
              </Button>
            )
          }
        </div>
      </div>
    );
  }

  renderTopSection = () => {
    return (
      <div>
        {renderItem('Email', this.props.applicationData.email, 'lineItem')}
        {renderItem('Regional Partner', this.props.applicationData.regional_partner_name, 'lineItem')}
        {renderItem('School Name', this.props.applicationData.school_name, 'lineItem')}
        {renderItem('District Name', this.props.applicationData.district_name, 'lineItem')}
      </div>
    );
  }

  renderQuestions = () => {
    return (
      <Facilitator1819Questions
        formResponses={this.props.applicationData.formData}
      />
    );
  }

  renderNotes = () => {
    return (
      <div>
        <h4>
          Notes
        </h4>
        <FormControl
          id="Notes"
          disabled={!this.state.editing}
          componentClass="textarea"
          value={this.state.notes || ''}
          onChange={this.handleNotesChange}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderTopSection()}
        {this.renderQuestions()}
        {this.renderNotes()}
      </div>
    );
  }
}

export {DetailViewContents, renderItem};
