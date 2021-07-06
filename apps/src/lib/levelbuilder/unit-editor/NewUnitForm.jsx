import React from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const buttonStyle = {
  marginLeft: 0,
  marginTop: 10,
  marginBottom: 20
};

export default function NewUnitForm() {
  return (
    <form action="/s" method="post">
      <RailsAuthenticityToken />
      <label>
        Unit Slug
        <HelpTip>
          <p>
            The unit slug is used to create the link to the unit. It is in the
            format of studio.code.org/s/unit-slug-here. A unit slug can only
            contain lowercase letters, numbers and dashes. Once you set the slug
            it can not be updated.
          </p>
        </HelpTip>
      </label>
      <input name="script[name]" />
      <input name="is_migrated" value={true} type="hidden" />
      <br />
      <button className="btn btn-primary" type="submit" style={buttonStyle}>
        Save Changes
      </button>
    </form>
  );
}
