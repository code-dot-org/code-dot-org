import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import LibraryTable from './LibraryTable';

import style from './library-category.module.scss';

class LibraryCategory extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    datasets: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string,
    importTable: PropTypes.func.isRequired,
    forceExpanded: PropTypes.bool,
  };

  state = {
    collapsed: true,
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    if (
      (newProps.forceExpanded && this.state.collapsed) ||
      (!newProps.forceExpanded && !this.state.collapsed)
    ) {
      this.toggleCollapsed();
    }
  }

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed,
    });

  render() {
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    return (
      <div>
        <a
          className={classNames(style.categoryName, 'uitest-dataset-category')}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome className="fa fa-fw" icon={icon} />
          <span>{this.props.name}</span>
          <span className={style.tableNumber}>
            {this.props.datasets.length}{' '}
            {this.props.datasets.length === 1 ? 'table' : 'tables'}
          </span>
        </a>
        {!this.state.collapsed && (
          <div className={style.collapsibleContainer}>
            {this.props.description && (
              <span className={style.categoryDescription}>
                {this.props.description}
              </span>
            )}
            {this.props.datasets.map(tableName => (
              <LibraryTable
                key={tableName}
                name={tableName}
                importTable={this.props.importTable}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default LibraryCategory;
