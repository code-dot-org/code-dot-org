import React from 'react';

import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

export default function NewProgrammingEnvironmentForm() {
  return (
    <form action="/programming_environments" method="post">
      <RailsAuthenticityToken />
      <h1>New Programming Environment</h1>
      <label>
        Programming Environment Slug
        <input name="name" style={styles.inputStyle} required />
        <HelpTip>
          <p>
            The programming environment slug is used in URLs and cannot be
            updated once set. A slug can only contain lowercase letters,
            numbers, and dashes. Likely, this should be the same at the project
            name for this programming environment.
          </p>
        </HelpTip>
      </label>
      <br />
      <button className="btn btn-primary" type="submit">
        Save Changes
      </button>
    </form>
  );
}

const styles = {
  inputStyle: {
    marginLeft: 5,
  },
};
