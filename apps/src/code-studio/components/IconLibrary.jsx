import PropTypes from 'prop-types';
import React from 'react';
import IconList from './IconList';
import SearchBar from '@cdo/apps/templates/SearchBar';
import i18n from '@cdo/locale';

/**
 * A component for managing icons.
 */
export default class IconLibrary extends React.Component {
  static propTypes = {
    alignment: PropTypes.string,
    assetChosen: PropTypes.func.isRequired
  };

  state = {search: ''};

  search = e => {
    this.setState({
      search: e.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '')
    });
  };

  render() {
    const styles = {
      searchArea: {
        float: this.props.alignment || 'right',
        margin: '10px 0'
      },
      input: {
        height: '20px',
        width: '300px',
        borderRadius: '4px',
        padding: '3px 7px'
      },
      icon: {
        right: '5px',
        top: '5px',
        fontSize: '16px',
        color: '#999'
      }
    };

    return (
      <div>
        <SearchBar
          onChange={this.search}
          placeholderText={i18n.iconSearchPlaceholder()}
          styles={styles}
        />
        <IconList
          assetChosen={this.props.assetChosen}
          search={this.state.search}
        />
      </div>
    );
  }
}
