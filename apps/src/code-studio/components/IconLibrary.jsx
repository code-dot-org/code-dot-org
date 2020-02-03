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
    assetChosen: PropTypes.func.isRequired
  };

  state = {search: ''};

  search = e => {
    this.setState({
      search: e.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '')
    });
  };

  render() {
    return (
      <div>
        <div style={{width: '300px', float: 'right', marginBottom: 10}}>
          <SearchBar
            onChange={this.search}
            placeholderText={i18n.iconSearchPlaceholder()}
          />
        </div>
        <IconList
          assetChosen={this.props.assetChosen}
          search={this.state.search}
        />
      </div>
    );
  }
}
