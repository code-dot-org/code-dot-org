import PropTypes from 'prop-types';
import React, {useState} from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import $ from 'jquery';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';

const categories = ['Full Courses', 'CSF', 'HOC', 'Other'];

export default function CourseOfferingEditor(props) {
  const [featured, setFeatured] = useState(props.initialIsFeatured);
  const [category, setCategory] = useState(props.initialCategory);
  const [displayName, setDisplayName] = useState(props.initialDisplayName);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    setError(null);
    setLastSaved(null);
    setIsSaving(true);

    let dataToSave = {
      key: props.courseOfferingKey,
      display_name: displayName,
      is_featured: featured,
      category: category
    };

    $.ajax({
      url: `/course_offerings/${props.courseOfferingKey}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(dataToSave)
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          navigateToHref(linkWithQueryParams('/'));
        } else {
          setLastSaved(Date.now());
          setIsSaving(false);
        }
      })
      .fail(error => {
        setError(error.responseText);
        setIsSaving(false);
      });
  };

  return (
    <div>
      <h1>{`Editing Course Offering: ${props.courseOfferingKey}`}</h1>
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
          {categories.map(category => (
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
      <SaveBar
        handleSave={handleSave}
        error={error}
        isSaving={isSaving}
        lastSaved={lastSaved}
        pathForShowButton={'/'}
      />
    </div>
  );
}

CourseOfferingEditor.propTypes = {
  courseOfferingKey: PropTypes.string,
  initialIsFeatured: PropTypes.bool,
  initialCategory: PropTypes.string,
  initialDisplayName: PropTypes.string
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
