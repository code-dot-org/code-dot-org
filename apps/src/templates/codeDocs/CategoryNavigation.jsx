import React, {useState} from 'react';
import PropTypes from 'prop-types';
import CodeDocLink from './CodeDocLink';

export default function CategoryNavigation({initialIsOpen, category}) {
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
            <li key={exp.name} style={styles.codeLink}>
              <CodeDocLink programmingExpression={exp} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

CategoryNavigation.propTypes = {
  initialIsOpen: PropTypes.bool,
  category: PropTypes.object
};

const styles = {
  codeLink: {
    backgroundColor: 'white',
    paddingLeft: 4
  },
  list: {
    listStyleType: 'none',
    marginLeft: 10
  }
};
