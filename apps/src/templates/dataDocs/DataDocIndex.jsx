import React from 'react';
import PropTypes from 'prop-types';
import {TextLink} from '@dsco_/link';

const DataDocIndex = ({dataDocs}) => (
  <>
    <h1 style={{marginBottom: 30}}>Data Docs</h1>
    <ul>
      {dataDocs.map(
        ({key, name}) =>
          name && (
            <li key={key}>
              <TextLink href={`/data_docs/${key}`} text={name} />
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
      content: PropTypes.string
    })
  )
};

export default DataDocIndex;
