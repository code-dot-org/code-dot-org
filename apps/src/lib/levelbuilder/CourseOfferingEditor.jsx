import PropTypes from 'prop-types';
import React, {useState} from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

export default function CourseOfferingEditor(props) {
  const [featured, setFeatured] = useState(props.initialIsFeatured);
  const [category, setCategory] = useState(props.initialCategory);
  const [displayName, setDisplayName] = useState(props.initialDisplayName);

  return (
    <div>
      <label>
        Display Name
        <input
          type="text"
          defaultValue={displayName}
          style={styles.input}
          onChange={e => setDisplayName(e.target.value)}
        />
      </label>
      <label>
        Category
        <select
          value={category}
          style={styles.dropdown}
          onChange={e => setCategory(e.target.value)}
        >
          {props.categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <HelpTip>
          <p>
            Course offerings are organized by category in the assignment
            dropdown.
          </p>
        </HelpTip>
      </label>
      <label>
        Featured In Category
        <HelpTip>
          <p>
            Featured items will show up at the top of the category in the
            assignment dropdown.
          </p>
        </HelpTip>
        <input
          type="checkbox"
          defaultChecked={featured}
          style={styles.checkbox}
          onChange={e => setFeatured(e.target.value)}
        />
      </label>
    </div>
  );
}

CourseOfferingEditor.propTypes = {
  initialIsFeatured: PropTypes.bool,
  initialCategory: PropTypes.string,
  initialDisplayName: PropTypes.string,
  categories: PropTypes.array
};

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0
  },
  dropdown: {
    margin: '0 6px'
  }
};
