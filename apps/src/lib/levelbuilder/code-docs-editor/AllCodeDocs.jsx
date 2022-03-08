import React, {useState} from 'react';
import PropTypes from 'prop-types';
import ProgrammingEnvironmentsTable from './ProgrammingEnvironmentsTable';
import ProgrammingExpressionsTable from './ProgrammingExpressionsTable';
import {TextLink} from '@dsco_/link';

export default function AllCodeDocs({
  programmingEnvironments,
  programmingEnvironmentsForSelect,
  categoriesForSelect
}) {
  const [ideSelected, setIdeSelectted] = useState(true);
  const ideSelectButtonStyle = {
    ...styles.button,
    ...styles.leftButton,
    ...(ideSelected && styles.selectedButton)
  };
  const docsSelectButtonStyle = {
    ...styles.button,
    ...styles.rightButton,
    ...(!ideSelected && styles.selectedButton)
  };

  return (
    <div>
      <h1>All Code Documentation</h1>
      <div style={styles.buttonRow}>
        <div>
          <button
            type="button"
            style={ideSelectButtonStyle}
            onClick={() => setIdeSelectted(true)}
          >
            IDEs
          </button>
          <button
            type="button"
            style={docsSelectButtonStyle}
            onClick={() => setIdeSelectted(false)}
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
        {' '}
        <ProgrammingExpressionsTable
          programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
          categoriesForSelect={categoriesForSelect}
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
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object),
  programmingEnvironmentsForSelect: PropTypes.arrayOf(PropTypes.object),
  categoriesForSelect: PropTypes.arrayOf(PropTypes.object)
};

const styles = {
  leftButton: {
    borderRadius: '4px 0px 0px 4px',
    marginRight: 0
  },
  rightButton: {
    borderRadius: '0px 4px 4px 0px',
    marginLeft: 0
  },
  selectedButton: {
    color: 'white',
    background: 'orange'
  },
  button: {
    fontSize: 'small',
    padding: 5
  },
  newLinks: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 25
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};
