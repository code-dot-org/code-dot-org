import React from 'react';
import PropTypes from 'prop-types';
import {Link} from '@dsco_/link';

const DataDocEditAll = ({dataDocs}) => {
  return (
    <div>
      <p>Data Docs Edit All</p>
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
    </div>
  );
};

DataDocEditAll.propTypes = {
  dataDocs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      content: PropTypes.string
    })
  )
};

export default DataDocEditAll;
