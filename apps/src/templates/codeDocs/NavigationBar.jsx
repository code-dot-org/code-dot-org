import React from 'react';
import PropTypes from 'prop-types';
import CategoryNavigation from './CategoryNavigation';

export default function NavigationBar({categoriesForNavigation}) {
  return (
    <div style={styles.header}>
      {categoriesForNavigation.map(category => (
        <CategoryNavigation key={category.key} category={category} />
      ))}
    </div>
  );
}

NavigationBar.propTypes = {
  categoriesForNavigation: PropTypes.arrayOf(PropTypes.object).isRequired
};

const styles = {
  header: {
    paddingRight: 5,
    minWidth: 150
  }
};
