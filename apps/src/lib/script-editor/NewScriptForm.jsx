import React from 'react';
import PropTypes from 'prop-types';

const buttonStyle = {
  marginLeft: 0,
  marginTop: 10,
  marginBottom: 20
};

export default function NewScriptForm({csrfToken}) {
  return (
    <form action="/s" method="post">
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <label>Name</label>
      <input name="script[name]" />
      <br />
      <button className="btn btn-primary" type="submit" style={buttonStyle}>
        Save Changes
      </button>
    </form>
  );
}

NewScriptForm.propTypes = {
  csrfToken: PropTypes.string.isRequired
};
