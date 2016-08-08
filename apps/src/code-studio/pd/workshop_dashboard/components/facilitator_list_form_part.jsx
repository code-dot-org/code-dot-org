/**
 * Dynamic list of facilitator select controls for creating & editing workshops.
 */

import React from 'react';
import {Row, Col, Button} from 'react-bootstrap';

const MAX_FACILITATORS = 10;

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

const FacilitatorListFormPart = React.createClass({
  propTypes: {
    availableFacilitators: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.number,
        name: React.PropTypes.string,
        email: React.PropTypes.string
      })
    ),
    facilitators: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.number,
        name: React.PropTypes.string,
        email: React.PropTypes.string
      })
    ).isRequired,
    course: React.PropTypes.string.isRequired,
    readOnly: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },

  handleAddClick() {
    this.props.facilitators.push({id: -1});
    this.props.onChange(this.props.facilitators);
  },

  handleRemoveClick(i) {
    this.props.facilitators.splice(i, 1)[0];
    this.props.onChange(this.props.facilitators);
  },

  renderRemoveButton(i) {
    return (
      <Button onClick={this.handleRemoveClick.bind(null, i)} >
        <i className="fa fa-minus" />
      </Button>
    );
  },

  renderFacilitatorRows() {
    if (!this.props.readOnly && this.props.facilitators.length === 0) {
      // Start with a placeholder empty row.
      this.props.facilitators.push({id: -1});
    }

    const rows = this.props.facilitators.map((facilitator, i, facilitators) => {
      if (this.props.readOnly) {
        return this.renderFacilitatorReadOnlyRow(facilitator, i);
      } else {
        // Remove already-selected facilitators from available list.
        const filteredAvailableFacilitators = this.props.availableFacilitators.filter(availableFacilitator => {
          return !facilitators.find(f => f.id === availableFacilitator.id);
        });
        return this.renderFacilitatorEditRow(facilitator, i, facilitators, filteredAvailableFacilitators);
      }
    });

    return (<div>{rows}</div>);
  },

  renderFacilitatorDisplay(facilitator) {
    return `${facilitator.name} (${facilitator.email})`;
  },

  renderFacilitatorReadOnlyRow(facilitator, i) {
    return (
      <Row key={i}>
        <Col sm={8}>
          <input
            className="form-control"
            value={this.renderFacilitatorDisplay(facilitator)}
            disabled={true}
            style={styles.readOnlyInput}
          />
        </Col>
      </Row>
    );
  },

  renderFacilitatorEditRow(facilitator, i, facilitators, filteredAvailableFacilitators) {
    if (filteredAvailableFacilitators.length === 0) {
      const text = this.props.course === '' ? 'Please select a course' : `No facilitators are available for ${this.props.course}`;
      return (
        <label key={i}>
          {text}
        </label>
      );
    }

    let addButton = null;
    if (i === facilitators.length - 1 && facilitators.length < MAX_FACILITATORS &&
      this.props.facilitators[i].id > 0 && filteredAvailableFacilitators.length > 1 ) {

      addButton = (
        <Button onClick={this.handleAddClick}>
          <i className="fa fa-plus"/>
        </Button>
      );
    }
    const removeButton = facilitators.length > 1 ? this.renderRemoveButton(i) : null;

    const facilitatorOptions = [this.renderFacilitatorOption(facilitator)].concat(
      filteredAvailableFacilitators.map(f => this.renderFacilitatorOption(f))
    );

    return (
      <Row key={i}>
        <Col sm={8}>
          <select
            className="form-control"
            value={facilitator.id}
            data-index={i}
            onChange={this.handleFacilitatorChange}
          >
            {facilitatorOptions}
          </select>
        </Col>
        <Col sm={2}>
          {addButton}
          {removeButton}
        </Col>
      </Row>
    );
  },

  renderFacilitatorOption(facilitator) {
    if (facilitator.id === -1) {
      return (
        <option key={-1}>-- Choose a facilitator --</option>
      );
    }

    return (
      <option value={facilitator.id} key={facilitator.id}>
        {this.renderFacilitatorDisplay(facilitator)}
      </option>
    );
  },

  handleFacilitatorChange(event) {
    const index = $(event.target).attr('data-index');
    const selectedId = event.target.value;

    this.props.facilitators[index] = this.props.availableFacilitators.find(f => f.id === parseInt(selectedId, 10));
    this.props.onChange(this.props.facilitators);
  },

  render() {
    return (
      <div className="facilitatorList">
        <h3>Facilitators</h3>
        {this.renderFacilitatorRows()}
      </div>
    );
  }
});
export default FacilitatorListFormPart;
