import React from 'react';
import PropTypes from 'prop-types';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const NewReferenceGuideForm = props => {
  const {baseUrl} = props;
  return (
    <form action={baseUrl} method="post">
      <RailsAuthenticityToken />
      <h1>New Reference Guide</h1>
      <label>
        Key
        <input name="key" required />
        <HelpTip>
          <p>
            The reference guide key is used in URLs and cannot be updated once
            set. A slug can only contain lowercase letters, numbers, and dashes.
            Also 'new' and 'edit' are reserved.
          </p>
        </HelpTip>
      </label>
      <br />
      <button className="btn btn-primary" type="submit">
        Save Changes
      </button>
    </form>
  );
};
NewReferenceGuideForm.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

export default NewReferenceGuideForm;
