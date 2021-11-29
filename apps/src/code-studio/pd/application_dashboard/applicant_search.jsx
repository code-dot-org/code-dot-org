import React from 'react';
import color from '@cdo/apps/util/color';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'react-bootstrap';
import $ from 'jquery';
import {Link} from 'react-router';

export default class ApplicantSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      results: [],
      lastSearch: null
    };
  }

  handleChange = event => {
    this.setState({
      email: event.target.value,
      results: [],
      lastSearch: null
    });
  };

  handleSearchClick = event => {
    event.preventDefault();
    if (this.state.email.length === 0) {
      return this.setState({lastSearch: null});
    }

    $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications/search?${$.param({
        email: this.state.email
      })}`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        lastSearch: this.state.email,
        results: data
      });
    });
  };

  render() {
    return (
      <Form inline>
        <FormGroup>
          <ControlLabel>Search for applicant by email</ControlLabel>
          <br />
          <FormControl
            type="text"
            value={this.state.email}
            placeholder="Enter Email"
            onChange={this.handleChange}
          />
          <Button type="submit" onClick={this.handleSearchClick}>
            Search
          </Button>
          {this.state.lastSearch && this.state.results.length === 0 && (
            <div style={styles.notFound}>Application not found</div>
          )}
          {this.state.results.length > 0 && (
            <ul>
              {this.state.results.map(r => (
                <li key={r.id}>
                  <Link to={`/${r.course}_${r.application_type}s/${r.id}`}>
                    {r.course} {r.application_type.toLowerCase()} application id{' '}
                    {r.id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </FormGroup>
      </Form>
    );
  }
}

const styles = {
  notFound: {
    color: color.red
  }
};
