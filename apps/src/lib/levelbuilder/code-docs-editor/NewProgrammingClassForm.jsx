import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

export default function NewProgrammingClassForm({
  programmingEnvironmentsForSelect
}) {
  const defaultEnvironmentName = queryString.parse(window.location.search)[
    'programming_environment'
  ];
  const defaultEnvironmentId = defaultEnvironmentName
    ? programmingEnvironmentsForSelect.find(
        el => el.name === defaultEnvironmentName
      )?.id
    : null;
  return (
    <form action="/programming_classes" method="post">
      <RailsAuthenticityToken />
      <label>
        Programming Class Slug
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
          defaultValue={defaultEnvironmentId}
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

NewProgrammingClassForm.propTypes = {
  programmingEnvironmentsForSelect: PropTypes.arrayOf(
    PropTypes.shape({id: PropTypes.number, name: PropTypes.string})
  ).isRequired
};

const styles = {
  inputStyle: {
    marginLeft: 5
  }
};
