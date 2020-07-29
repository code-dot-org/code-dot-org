import React from 'react';
import RailsAuthenticityToken from '../util/RailsAuthenticityToken';

const buttonStyle = {
  marginLeft: 0,
  marginTop: 10,
  marginBottom: 20
};

export default function NewScriptForm() {
  return (
    <form action="/s" method="post">
      <RailsAuthenticityToken />
      <label>Name</label>
      <input name="script[name]" />
      <br />
      <button className="btn btn-primary" type="submit" style={buttonStyle}>
        Save Changes
      </button>
    </form>
  );
}
