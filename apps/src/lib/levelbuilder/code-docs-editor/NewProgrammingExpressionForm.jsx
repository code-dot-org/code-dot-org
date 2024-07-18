import PropTypes from 'prop-types';
import React from 'react';

import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

export default function NewProgrammingExpressionForm({
  programmingEnvironmentsForSelect,
}) {
  return (
    <form action="/programming_expressions" method="post">
      <RailsAuthenticityToken />
      <label>
        Programming Expression Slug
        <input name="key" style={styles.inputStyle} required />
        <HelpTip>
          <p>
            The programming expression slug is used in URLs and cannot be
            updated once set. A slug can only contain letters, numbers, periods,
            underscores, and dashes.
          </p>
        </HelpTip>
      </label>
      <label>
        Programming Environment
        <select
          name="programming_environment_id"
          style={styles.inputStyle}
          required
        >
          {programmingEnvironmentsForSelect.map(programmingEnvironment => (
            <option
              key={programmingEnvironment.id}
              value={programmingEnvironment.id}
            >
              {programmingEnvironment.name}
            </option>
          ))}
        </select>
      </label>
      <br />
      <button className="btn btn-primary" type="submit">
        Save Changes
      </button>
    </form>
  );
}

NewProgrammingExpressionForm.propTypes = {
  programmingEnvironmentsForSelect: PropTypes.arrayOf(
    PropTypes.shape({id: PropTypes.number, name: PropTypes.string})
  ).isRequired,
};

const styles = {
  inputStyle: {
    marginLeft: 5,
  },
};
