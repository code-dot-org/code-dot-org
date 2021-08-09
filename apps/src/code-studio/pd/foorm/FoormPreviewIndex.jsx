import PropTypes from 'prop-types';
import React from 'react';

export default class FoormPreviewIndex extends React.Component {
  static propTypes = {
    forms: PropTypes.arrayOf(PropTypes.object)
  };

  properties = [
    {id: 'workshopCourse', caption: 'Workshop course', type: 'text'},
    {id: 'workshopSubject', caption: 'Workshop subject', type: 'text'},
    {id: 'regionalPartnerName', caption: 'Regional partner name', type: 'text'},
    {id: 'isVirtual', caption: 'Is virtual', type: 'checkbox'},
    {id: 'isFridayInstitute', caption: 'Is Friday Institute', type: 'checkbox'},
    {id: 'workshopAgenda', caption: 'Workshop Agenda', type: 'text'}
  ];

  constructor(props) {
    super(props);

    const state = {};
    this.properties.forEach(property => {
      state[property.id] = property.type === 'text' ? '' : false;
    });
    this.state = state;
  }

  onChange(id, event) {
    const type = this.properties.find(property => property.id === id).type;

    this.setState({
      [id]: type === 'checkbox' ? event.target.checked : event.target.value
    });
  }

  getFormUrl(form) {
    const baseUrl = form.url;
    let params = [];

    this.properties.forEach(property => {
      const value = this.state[property.id];
      if (
        (property.type === 'checkbox' && value) ||
        (property.type === 'text' && value !== '')
      ) {
        params.push(property.id + '=' + encodeURIComponent(value));
      }
    });

    let fullUrl =
      params.length > 0 ? baseUrl + '?' + params.join('&') : baseUrl;

    return fullUrl;
  }

  render() {
    return (
      <div>
        <h1>Form previews</h1>
        <h2>Optional overrides</h2>
        {this.properties.map(property => {
          return (
            <div style={styles.row} key={property.id}>
              <div style={styles.caption}>{property.caption}:</div>
              <input
                style={styles.input}
                value={this.state[property.id]}
                type={property.type}
                onChange={this.onChange.bind(this, property.id)}
              />
            </div>
          );
        })}
        <br />

        <h2>Preview</h2>
        {this.props.forms.map((form, index) => (
          <div style={styles.linkContainer} key={index}>
            <a
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
              href={this.getFormUrl(form)}
            >
              {form.name}
            </a>
          </div>
        ))}
        <br />
      </div>
    );
  }
}

const styles = {
  row: {
    clear: 'both'
  },
  caption: {
    float: 'left',
    width: 300
  },
  input: {
    float: 'left'
  },
  linkContainer: {
    marginBottom: 7
  },
  link: {
    fontSize: 15
  }
};
