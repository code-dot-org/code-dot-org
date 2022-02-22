import React, {useState} from 'react';
import PropTypes from 'prop-types';
import CodeDocLink from './CodeDocLink';

export function CategoryNavigation({initialIsOpen, category}) {
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
      {isOpen && (
        <ul style={styles.list}>
          {category.programmingExpressions.map(exp => (
            <li key={exp.key} style={styles.codeLink}>
              <CodeDocLink programmingExpression={exp} showBlocks={false} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const categoryShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  programmingExpressions: PropTypes.arrayOf(PropTypes.object)
});

CategoryNavigation.propTypes = {
  initialIsOpen: PropTypes.bool,
  category: categoryShape.isRequired
};

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
  categoriesForNavigation: PropTypes.arrayOf(categoryShape).isRequired
};

const styles = {
  header: {
    paddingRight: 5,
    minWidth: 150
  },
  codeLink: {
    backgroundColor: 'white',
    paddingLeft: 4
  },
  list: {
    listStyleType: 'none',
    marginLeft: 10
  }
};
