import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';

const styles = {
  categoryName: {
    fontFamily: '"Gotham 7r", sans-serif',
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
  }
};

class DataCategory extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    datasets: PropTypes.arrayOf(PropTypes.string).isRequired,
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
        <div onClick={this.toggleCollapsed}>
          <FontAwesome icon={icon} />
          <span style={styles.categoryName}>{this.props.name}</span>
          <span style={styles.tableNumber}>
            {this.props.datasets.length}{' '}
            {this.props.datasets.length === 1 ? 'table' : 'tables'}
          </span>
        </div>
        {!this.state.collapsed && (
          <div>
            <span style={styles.categoryDescription}>
              {this.props.description}
            </span>
            <ul>
              {this.props.datasets.map(dataset => (
                <li style={styles.tableName} key={dataset}>
                  {dataset}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default Radium(DataCategory);
