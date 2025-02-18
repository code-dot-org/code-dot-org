import {TextLink} from '@dsco_/link';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import ProgrammingEnvironmentsTable from './ProgrammingEnvironmentsTable';
import ProgrammingExpressionsTable from './ProgrammingExpressionsTable';

/*
 * A component that holds multiple sub-components and allows switching between
 * them. As of April 2021, it holds a table of programming environments and a
 * table of programming expressions.
 */
export default function AllCodeDocs({programmingEnvironments, allCategories}) {
  const [ideSelected, setIdeSelected] = useState(true);
  const ideSelectButtonStyle = {
    ...styles.button,
    ...styles.leftButton,
    ...(ideSelected && styles.selectedButton),
  };
  const docsSelectButtonStyle = {
    ...styles.button,
    ...styles.rightButton,
    ...(!ideSelected && styles.selectedButton),
  };

  return (
    <div>
      <h1>All Code Documentation</h1>
      <div style={styles.buttonRow}>
        <div>
          <button
            type="button"
            style={ideSelectButtonStyle}
            onClick={() => setIdeSelected(true)}
          >
            IDEs
          </button>
          <button
            type="button"
            style={docsSelectButtonStyle}
            onClick={() => setIdeSelected(false)}
          >
            Code Documentation
          </button>
        </div>
        <div style={styles.newLinks}>
          <TextLink
            href="/programming_environments/new"
            icon={<i className="fa fa-plus-circle" aria-hidden="true" />}
            text="New IDE"
            iconBefore
            openInNewTab
          />
          <TextLink
            href="/programming_expressions/new"
            icon={<i className="fa fa-plus-circle" aria-hidden="true" />}
            text="New Code Doc"
            iconBefore
            openInNewTab
          />
        </div>
      </div>
      <div>
        <ProgrammingExpressionsTable
          allProgrammingEnvironments={programmingEnvironments}
          allCategories={allCategories}
          hidden={ideSelected}
        />
        <ProgrammingEnvironmentsTable
          programmingEnvironments={programmingEnvironments}
          hidden={!ideSelected}
        />
      </div>
    </div>
  );
}

AllCodeDocs.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object).isRequired,
  allCategories: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const styles = {
  leftButton: {
    borderRadius: '4px 0px 0px 4px',
    marginRight: 0,
  },
  rightButton: {
    borderRadius: '0px 4px 4px 0px',
    marginLeft: 0,
  },
  selectedButton: {
    color: 'white',
    background: 'orange',
  },
  button: {
    fontSize: 'small',
    padding: 5,
  },
  newLinks: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 25,
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};
