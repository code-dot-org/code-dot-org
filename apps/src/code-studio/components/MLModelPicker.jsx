import PropTypes from 'prop-types';
import React from 'react';
import color from '../../util/color';

const styles = {
  root: {
    margin: '0 0 0 5px'
  },
  divider: {
    borderColor: color.purple,
    margin: '5px 0'
  },
  warning: {
    color: color.red,
    fontSize: 13,
    fontWeight: 'bold'
  }
};

/**
 * A component for managing hosted sounds and the Sound Library.
 */
export default class MLModelPicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    typeFilter: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    showUnderageWarning: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool.isRequired,
    libraryOnly: PropTypes.bool
  };

  render() {
    return (
      <div className="modal-content" style={styles.root}>
        {'ML Model'}
        <hr style={styles.divider} />
        {'this is my content'}
      </div>
    );
  }
}
