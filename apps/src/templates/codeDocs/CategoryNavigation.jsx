import React, {useState} from 'react';
import PropTypes from 'prop-types';

export default function CategoryNavigation({
  name,
  initialIsOpen,
  color,
  links
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen || false);
  return (
    <div
      style={{backgroundColor: color, borderLeftColor: color}}
      onClick={() => setIsOpen(!isOpen)}
    >
      {name}
      {isOpen && (
        <ul style={styles.list}>
          {links.map(link => (
            <li key={link.name} style={styles.codeLink}>
              <a href={link.href}>{link.name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

CategoryNavigation.propTypes = {
  name: PropTypes.string.isRequired,
  initialIsOpen: PropTypes.bool,
  color: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired
    })
  )
};

const styles = {
  codeLink: {
    backgroundColor: 'white',
    paddingLeft: 4
  },
  list: {
    listStyleType: 'none'
  }
};
