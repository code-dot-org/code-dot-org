import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';
import LibraryTable from './LibraryTable';

const styles = {
  categoryName: {
    fontFamily: '"Gotham 7r", sans-serif',
    cursor: 'pointer',
    color: color.dark_charcoal
  },
  tableNumber: {
    float: 'right',
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.light_gray
  },
  categoryDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.dark_charcoal
  },
  tableName: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.cyan
  },
  collapsibleContainer: {
    paddingLeft: '8px'
  }
};

class LibraryCategory extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
    description: PropTypes.string.isRequired
  };

  state = {
    collapsed: true
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  render() {
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    return (
      <div>
        <a style={styles.categoryName} onClick={this.toggleCollapsed}>
          <FontAwesome icon={icon} />
          <span>{this.props.name}</span>
          <span style={styles.tableNumber}>
            {this.props.datasets.length}{' '}
            {this.props.datasets.length === 1 ? 'table' : 'tables'}
          </span>
        </a>
        {!this.state.collapsed && (
          <div style={styles.collapsibleContainer}>
            <span style={styles.categoryDescription}>
              {this.props.description}
            </span>
            {this.props.datasets.map(dataset => (
              <LibraryTable
                key={dataset.name}
                name={dataset.name}
                description={dataset.description}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default Radium(LibraryCategory);
