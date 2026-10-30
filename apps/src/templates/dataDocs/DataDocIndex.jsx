import {Link} from '@dsco_/link';
import PropTypes from 'prop-types';
import React from 'react';

const DataDocIndex = ({dataDocs}) => (
  <>
    <h1 style={{marginBottom: 30}}>Data Docs</h1>
    <ul>
      {dataDocs.map(
        ({key, name, content}) =>
          name &&
          content && (
            <li key={key}>
              <Link href={`/data_docs/${key}`}>{name}</Link>
            </li>
          )
      )}
    </ul>
  </>
);

DataDocIndex.propTypes = {
  dataDocs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      content: PropTypes.string,
    })
  ),
};

export default DataDocIndex;
