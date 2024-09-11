import PropTypes from 'prop-types';
import React from 'react';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';

const NewReferenceGuideForm = props => {
  const {baseUrl} = props;
  return (
    <form action={baseUrl} method="post">
      <RailsAuthenticityToken />
      <h1>New Reference Guide</h1>
      <label>
        Slug
        <HelpTip>
          <p>
            The reference guide slug is used in URLs and cannot be updated once
            set. A slug can only contain lowercase letters, numbers, and dashes,
            and 'new' and 'edit' are reserved.
          </p>
        </HelpTip>
        <input className="input" name="key" required />
      </label>
      <br />
      <button className="btn btn-primary" type="submit">
        Save Changes
      </button>
    </form>
  );
};
NewReferenceGuideForm.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};

export default NewReferenceGuideForm;
