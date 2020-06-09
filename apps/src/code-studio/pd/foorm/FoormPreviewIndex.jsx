import PropTypes from 'prop-types';
import React from 'react';

export default class FoormPreviewIndex extends React.Component {
  static propTypes = {
    forms: PropTypes.arrayOf(PropTypes.object)
  };

  state = {
    properties: {
      workshopCourse: '',
      workshopSubject: '',
      regionalPartnerName: '',
      isVirtual: false
    }
  };

  // Assume that the properties are strings unless listed here as a checkbox.
  checkboxProperties = ['isVirtual'];

  getFormUrl(form) {
    const baseUrl = form.url;
    let params = [];

    Object.keys(this.state.properties).forEach(name => {
      const value = this.state.properties[name];
      if (value !== '') {
        params.push(name + '=' + encodeURIComponent(value));
      }
    });

    let fullUrl =
      params.length > 0 ? baseUrl + '?' + params.join('&') : baseUrl;

    return fullUrl;
  }

  onChange(name, event) {
    const isCheckbox = this.checkboxProperties.includes(name);

    this.setState({
      properties: {
        ...this.state.properties,
        [name]: isCheckbox ? event.target.checked : event.target.value
      }
    });
  }

  render() {
    return (
      <div>
        {Object.keys(this.state.properties).map(name => {
          const isCheckbox = this.checkboxProperties.includes(name);
          const type = isCheckbox ? 'checkbox' : null;

          return (
            <div key={name}>
              {name}:
              <input
                value={this.state.properties[name]}
                type={type}
                onChange={this.onChange.bind(this, name)}
              />
            </div>
          );
        })}

        {this.props.forms.map((form, index) => (
          <div key={index}>
            <a href={this.getFormUrl(form)}>{form.name}</a>
          </div>
        ))}
      </div>
    );
  }
}
