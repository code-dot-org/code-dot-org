/**
 * Dynamic list of facilitator select controls for creating & editing workshops.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {Row, Col, Button} from 'react-bootstrap';

const MAX_FACILITATORS = 10;

export default class FacilitatorListFormPart extends React.Component {
  static propTypes = {
    availableFacilitators: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        email: PropTypes.string
      })
    ),
    facilitators: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        email: PropTypes.string
      })
    ).isRequired,
    course: PropTypes.string.isRequired,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func
  };

  handleAddClick = () => {
    this.props.facilitators.push({id: -1});
    this.props.onChange(this.props.facilitators);
  };

  handleRemoveClick = i => {
    this.props.facilitators.splice(i, 1)[0];
    this.props.onChange(this.props.facilitators);
  };

  renderRemoveButton(i) {
    return (
      <Button
        id={`remove-facilitator${i}-btn`}
        onClick={this.handleRemoveClick.bind(null, i)}
      >
        <i className="fa fa-minus" />
      </Button>
    );
  }

  renderFacilitatorRows() {
    if (!this.props.readOnly && this.props.facilitators.length === 0) {
      // Start with a placeholder empty row.
      this.props.facilitators.push({id: -1});
    }

    let filteredAvailableFacilitators = null;
    // Remove already-selected facilitators from available list.
    if (!this.props.readOnly) {
      filteredAvailableFacilitators = this.props.availableFacilitators.filter(
        availableFacilitator =>
          !this.props.facilitators.find(f => f.id === availableFacilitator.id)
      );
    }

    const rows = this.props.facilitators.map((facilitator, i, facilitators) => {
      if (this.props.readOnly) {
        return this.renderFacilitatorReadOnlyRow(facilitator, i);
      } else {
        return this.renderFacilitatorEditRow(
          facilitator,
          i,
          facilitators,
          filteredAvailableFacilitators
        );
      }
    });

    return <div>{rows}</div>;
  }

  renderFacilitatorDisplay(facilitator) {
    return `${facilitator.name} (${facilitator.email})`;
  }

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
  }

  renderFacilitatorEditRow(
    facilitator,
    i,
    facilitators,
    filteredAvailableFacilitators
  ) {
    // Placeholder only (id -1) and none available? Display appropriate message.
    if (
      facilitators.length === 1 &&
      facilitators[0].id === -1 &&
      filteredAvailableFacilitators.length === 0
    ) {
      const text =
        this.props.course === ''
          ? 'Please select a course'
          : `No facilitators are available for ${this.props.course}`;
      return <label key={i}>{text}</label>;
    }

    let addButton = null;
    // Only show add button on the last row, when we're below the max,
    // when it's not a placeholder (id -1), and we have at least one available to add
    if (
      i === facilitators.length - 1 &&
      facilitators.length < MAX_FACILITATORS &&
      this.props.facilitators[i].id > 0 &&
      filteredAvailableFacilitators.length >= 1
    ) {
      addButton = (
        <Button onClick={this.handleAddClick} id="add-facilitator-btn">
          <i className="fa fa-plus" />
        </Button>
      );
    }

    // Show the remove button as long as we have > 1 facilitator
    const removeButton =
      facilitators.length > 1 ? this.renderRemoveButton(i) : null;

    const facilitatorOptions = [
      this.renderFacilitatorOption(facilitator)
    ].concat(
      filteredAvailableFacilitators.map(f => this.renderFacilitatorOption(f))
    );

    return (
      <Row key={i}>
        <Col sm={8}>
          <select
            className="form-control"
            id={`facilitator${i}`}
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
  }

  renderFacilitatorOption(facilitator) {
    if (facilitator.id === -1) {
      return <option key={-1}>-- Choose a facilitator --</option>;
    }

    return (
      <option value={facilitator.id} key={facilitator.id}>
        {this.renderFacilitatorDisplay(facilitator)}
      </option>
    );
  }

  handleFacilitatorChange = event => {
    const index = $(event.target).attr('data-index');
    const selectedId = event.target.value;

    this.props.facilitators[index] = this.props.availableFacilitators.find(
      f => f.id === parseInt(selectedId, 10)
    );
    this.props.onChange(this.props.facilitators);
  };

  render() {
    return (
      <div className="facilitatorList">
        <h3>Facilitators</h3>
        {this.renderFacilitatorRows()}
      </div>
    );
  }
}

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};
