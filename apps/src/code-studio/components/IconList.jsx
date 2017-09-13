import React, {PropTypes} from 'react';
import IconListEntry from './IconListEntry';
import { aliases } from './icons';
import i18n from '@cdo/locale';

/**
 * A component for managing icons.
 */
export default class IconList extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    search: PropTypes.string.isRequired
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
        clear: 'both'
      }
    };

    let search = this.props.search;
    if (search[0] !== '-') {
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
        {iconEntries.length > 0 ? iconEntries : i18n.noIconsFound()}
      </div>
    );
  }
}
