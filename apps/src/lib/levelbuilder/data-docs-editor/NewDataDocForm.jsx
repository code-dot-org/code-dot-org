import React from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const NewDataDocForm = () => {
  return (
    <form action="/data_docs" method="post">
      <RailsAuthenticityToken />
      <h1>New Data Doc</h1>
      <label>
        Slug
        <HelpTip>
          <p>
            The data doc slug is used in URLs and cannot be updated once set. A
            slug can only contain lowercase letters, numbers, and dashes, and
            'new' and 'edit' are reserved.
          </p>
        </HelpTip>
        <input className="input" name="key" required />
      </label>
      <label>
        Name
        <input className="input" name="name" />
      </label>
      <label>
        Content
        <input className="input" name="content" />
      </label>
      <br />
      <button className="btn btn-primary" type="submit">
        Save Changes
      </button>
    </form>
  );
};

export default NewDataDocForm;
