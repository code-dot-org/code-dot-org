import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component for managing icons.
 */
export default class DatasetLibrary extends React.Component {
  static propTypes = {
    alignment: PropTypes.string,
    assetChosen: PropTypes.func.isRequired
  };

  render() {
    // const styles = {
    //   root: {
    //     float: this.props.alignment || 'right',
    //     position: 'relative',
    //     margin: '10px 0'
    //   },
    //   input: {
    //     width: '300px',
    //     border: '1px solid #999',
    //     borderRadius: '4px',
    //     padding: '3px 7px'
    //   },
    //   icon: {
    //     position: 'absolute',
    //     right: '5px',
    //     top: '5px',
    //     fontSize: '16px',
    //     color: '#999'
    //   }
    // };

    return <div>"hello"</div>;
  }
}
