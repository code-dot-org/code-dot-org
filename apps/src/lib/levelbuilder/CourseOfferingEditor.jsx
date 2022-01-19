import PropTypes from 'prop-types';
import React, {useState} from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import $ from 'jquery';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';
import {CourseOfferingCategories} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

const useCourseOffering = initialCourseOffering => {
  const [courseOffering, setCourseOffering] = useState(initialCourseOffering);
  const updateCourseOffering = (key, value) => {
    setCourseOffering({...courseOffering, [key]: value});
  };

  return [courseOffering, updateCourseOffering];
};

export default function CourseOfferingEditor(props) {
  const [courseOffering, updateCourseOffering] = useCourseOffering(
    props.initialCourseOffering
  );
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    setError(null);
    setLastSaved(null);
    setIsSaving(true);

    $.ajax({
      url: `/course_offerings/${courseOffering.key}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(courseOffering)
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
      <h1>{`Editing Course Offering: ${courseOffering.key}`}</h1>
      <label>
        Display Name
        <input
          type="text"
          defaultValue={courseOffering.display_name}
          style={styles.input}
          onChange={e => updateCourseOffering('display_name', e.target.value)}
        />
      </label>
      <label>
        Category
        <select
          value={courseOffering.category}
          style={styles.dropdown}
          onChange={e => updateCourseOffering('category', e.target.value)}
        >
          {Object.values(CourseOfferingCategories).map(category => (
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
          defaultChecked={courseOffering.is_featured}
          style={styles.checkbox}
          onChange={e => updateCourseOffering('is_featured', e.target.value)}
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
  initialCourseOffering: PropTypes.shape({
    key: PropTypes.string,
    is_featured: PropTypes.bool,
    category: PropTypes.string,
    display_name: PropTypes.string
  })
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
