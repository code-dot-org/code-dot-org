import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import escapeSpecialCharactersForRegExp from '@cdo/apps/util/escapeSpecialCharactersForRegExp';
import i18n from '@cdo/locale';

import IconListEntry from './IconListEntry';
import {aliases} from './icons';

/**
 * A component for managing icons.
 */
export default class IconList extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    search: PropTypes.string.isRequired,
  };

  getMatches(query) {
    const results = {};

    Object.keys(aliases).forEach(function (alias) {
      if (query.test(alias)) {
        aliases[alias].forEach(function (match) {
          results[match] = alias;
        });
      }
    });

    return results;
  }

  render() {
    const styles = {
      root: {
        height: '330px',
        overflowY: 'scroll',
        clear: 'both',
      },
    };

    let search = escapeSpecialCharactersForRegExp(this.props.search);
    if (this.props.search[0] !== '-') {
      search = '(^|-)' + search;
    }
    const query = new RegExp(search);
    const results = this.getMatches(query);

    const iconEntries = Object.keys(results).map(iconId => (
      <IconListEntry
        key={iconId}
        assetChosen={this.props.assetChosen}
        iconId={iconId}
        altMatch={results[iconId]}
        query={query}
        search={this.props.search}
      />
    ));

    return (
      <div style={styles.root}>
        {iconEntries.length > 0 ? (
          iconEntries
        ) : (
          <MuiTypography variant="body2" component="div">
            {i18n.noIconsFound()}
          </MuiTypography>
        )}
      </div>
    );
  }
}
