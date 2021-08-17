import PropTypes from 'prop-types';
import React from 'react';
import {Row, Col} from 'react-bootstrap';

export default class OrganizerFormPart extends React.Component {
  static propTypes = {
    workshopId: PropTypes.number,
    organizerId: PropTypes.number,
    organizerName: PropTypes.string,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool
  };

  state = {
    loading: true,
    potentialOrganizers: null,
    error: false
  };

  UNSAFE_componentWillMount() {
    this.load(this.props.workshopId);
  }

  load() {
    let url = `/api/v1/pd/workshops/${
      this.props.workshopId
    }/potential_organizers`;

    $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.setState({
          loading: false,
          potentialOrganizers: data
        });
      })
      .error(() => {
        this.setState({error: true});
      });
  }

  renderOrganizerOption(organizer) {
    return (
      <option value={organizer.value} key={organizer.value}>
        {organizer.label}
      </option>
    );
  }

  render() {
    let organizerOptions;
    if (this.state.potentialOrganizers) {
      organizerOptions = this.state.potentialOrganizers.map(o =>
        this.renderOrganizerOption(o)
      );
    } else {
      organizerOptions = [];
    }
    return (
      <div>
        <h3>Organizer (admin)</h3>
        <Row>
          <Col sm={8}>
            {this.state.potentialOrganizers && (
              <select
                className="form-control"
                value={this.props.organizerId}
                onChange={this.props.onChange}
                disabled={this.props.readOnly}
                style={this.props.readOnly && styles.readOnlyInput}
              >
                {organizerOptions}
              </select>
            )}
            {!this.state.potentialOrganizers && (
              <h4>{this.props.organizerName}</h4>
            )}
            {this.state.error && (
              <p style={styles.error}>
                An error occurred loading the organizer dropdown. Try reloading
                the page.
              </p>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  },
  error: {
    color: 'red'
  }
};
