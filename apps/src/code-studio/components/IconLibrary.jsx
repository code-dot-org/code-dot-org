import React, {PropTypes} from 'react';
import IconList from './IconList';
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

  search = (e) => {
    this.setState({
      search: e.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '')
    });
  };

  render() {
    const styles = {
      root: {
        float: this.props.alignment || 'right',
        position: 'relative',
        margin: '10px 0'
      },
      input: {
        width: '300px',
        border: '1px solid #999',
        borderRadius: '4px',
        padding: '3px 7px'
      },
      icon: {
        position: 'absolute',
        right: '5px',
        top: '5px',
        fontSize: '16px',
        color: '#999'
      }
    };

    return (
      <div>
        <div style={styles.root}>
          <input
            onChange={this.search}
            style={styles.input}
            placeholder={i18n.iconSearchPlaceholder()}
          />
          <i className="fa fa-search" style={styles.icon}/>
        </div>
        <IconList
          assetChosen={this.props.assetChosen}
          search={this.state.search}
        />
      </div>
    );
  }
}
