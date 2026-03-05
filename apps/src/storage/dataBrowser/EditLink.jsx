import PropTypes from 'prop-types';
import React from 'react';

import dataStyles from './data-styles.module.scss';

class EditLink extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    return (
      <button
        type="button"
        className={dataStyles.link}
        onClick={this.props.onClick}
      >
        {this.props.name}
      </button>
    );
  }
}

export default EditLink;
