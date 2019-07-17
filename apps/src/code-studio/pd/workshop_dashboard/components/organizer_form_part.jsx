import PropTypes from 'prop-types';
import React from 'react';
import {Row, Col} from 'react-bootstrap';

export default class OrganizerFormPart extends React.Component {
  static propTypes = {
    organizers: PropTypes.array,
    organizer_id: PropTypes.number,
    onChange: PropTypes.func
  };

  renderOrganizerOption(organizer) {
    return (
      <option value={organizer.value} key={organizer.value}>
        {organizer.label}
      </option>
    );
  }

  render() {
    const organizerOptions = this.props.organizers.map(o =>
      this.renderOrganizerOption(o)
    );
    return (
      <div>
        <h3>Organizer (admin)</h3>
        <Row>
          <Col sm={8}>
            <select
              className="form-control"
              value={this.props.organizer_id}
              onChange={this.props.onChange}
            >
              {organizerOptions}
            </select>
          </Col>
        </Row>
      </div>
    );
  }
}
