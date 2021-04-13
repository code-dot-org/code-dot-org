import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';

const styles = {
  container: {
    color: color.black,
    textAlign: 'left',
    backgroundColor: color.lightest_gray,
    borderRadius: 5,
    padding: 20,
    whiteSpace: 'normal',
    lineHeight: 1.5,
    maxHeight: 'calc(80vh - 140px)',
    overflow: 'scroll'
  },
  subPanel: {
    backgroundColor: color.lighter_gray,
    borderRadius: 5,
    margin: 20,
    padding: 20
  },
  bold: {
    fontFamily: "'Gotham 7r', sans-serif"
  }
};

export default class ModelCard extends React.Component {
  static propTypes = {
    model: PropTypes.object
  };

  render() {
    const model = this.props.model;
    const metadata = model?.metadata;

    return (
      <div>
        {model && metadata && (
          <div style={styles.container}>
            <div>
              <span style={styles.bold}>Name:</span> &nbsp;
              {metadata.name}
            </div>
            <div>
              <span style={styles.bold}>Columns:</span>
              <div style={styles.subPanel}>
                {metadata.columns &&
                  metadata.columns.map(column => {
                    return (
                      <div key={column.id}>
                        <span style={styles.bold}>{column.id}:</span> &nbsp;
                        {column.description}
                      </div>
                    );
                  })}
              </div>
            </div>
            <div>
              <span style={styles.bold}>How can this model be used?</span>{' '}
              &nbsp;
              {metadata.potentialUses}
            </div>
            <div>
              <span style={styles.bold}>
                How can this model be potentially misused?
              </span>{' '}
              &nbsp;
              {metadata.potentialMisuses}
            </div>
            <div>
              <span style={styles.bold}>
                Has this model been trained on data that can identify a
                subgroup?
              </span>{' '}
              &nbsp;
              {metadata.identifySubgroup ? 'yes' : 'no'}
            </div>
            <div>
              <span style={styles.bold}>
                Have we ensured the data has adequate representation of
                subgroups?
              </span>{' '}
              &nbsp;
              {metadata.representSubgroup ? 'yes' : 'no'}
            </div>
            <div>
              <span style={styles.bold}>
                Could this model be used to inform decisions central to human
                life?
              </span>{' '}
              &nbsp;
              {metadata.decisionsLife ? 'yes' : 'no'}
            </div>
          </div>
        )}
      </div>
    );
  }
}
