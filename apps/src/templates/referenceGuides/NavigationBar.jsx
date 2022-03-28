import React, {useState} from 'react';
import PropTypes from 'prop-types';

export const CategoryNavigation = ({initialIsOpen, category}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen || false);
  return (
    <div
      style={{
        backgroundColor: category.color,
        borderLeftColor: category.color,
        marginBottom: 5,
        width: 150
      }}
    >
      <span
        style={{padding: '5px 10px', display: 'block'}}
        onClick={() => setIsOpen(!isOpen)}
      >
        {category.name}
      </span>
      {isOpen && category.content}
    </div>
  );
};

const categoryShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  content: PropTypes.node,
  color: PropTypes.string
});

CategoryNavigation.propTypes = {
  initialIsOpen: PropTypes.bool,
  category: categoryShape.isRequired
};

export default function NavigationBar({items, initialCategoryKey}) {
  return (
    <div style={styles.header}>
      {items.map(category => (
        <CategoryNavigation
          key={category.key}
          category={category}
          initialIsOpen={
            initialCategoryKey && category.key === initialCategoryKey
          }
        />
      ))}
    </div>
  );
}

NavigationBar.propTypes = {
  items: PropTypes.arrayOf(categoryShape).isRequired,
  initialCategoryKey: PropTypes.string
};

const styles = {
  header: {
    paddingRight: 5,
    minWidth: 150
  }
};
