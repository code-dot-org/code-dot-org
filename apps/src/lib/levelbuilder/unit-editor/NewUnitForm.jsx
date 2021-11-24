import React, {useState} from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';
import PropTypes from 'prop-types';

const buttonStyle = {
  marginLeft: 0,
  marginTop: 10,
  marginBottom: 20
};

export default function NewUnitForm(props) {
  const [courseStyle, setCourseStyle] = useState('');
  const [selectedFamilyName, setSelectedFamilyName] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [versionedCourse, setVersionedCourse] = useState('');
  const [versionYear, setVersionYear] = useState('');

  const getScriptName = () => {
    const familyName = selectedFamilyName ? selectedFamilyName : newFamilyName;

    const name =
      versionYear !== 'unversioned'
        ? familyName + '-' + versionYear
        : familyName;
    return name;
  };

  const getFamilyNameValue = () => {
    if (selectedFamilyName !== '') {
      return selectedFamilyName;
    } else if (newFamilyName !== '') {
      return newFamilyName;
    } else {
      return '';
    }
  };

  return (
    <form action="/s" method="post">
      <RailsAuthenticityToken />
      <label>
        Is this unit going to be in a course with one unit or multiple units?
        <select
          style={styles.dropdown}
          value={courseStyle}
          name="is_course"
          onChange={e => setCourseStyle(e.target.value)}
        >
          <option key={'empty'} value={''}>
            {''}
          </option>
          <option key={'multi-unit'} value={'multi-unit'}>
            {'Multiple Units'}
          </option>
          <option key={'single-unit'} value={'single-unit'}>
            {'Single Unit'}
          </option>
          ))}
        </select>
        <HelpTip>
          <p>
            There are two different types of courses we support. A course with
            multiple units and a course that is a single unit.
          </p>
        </HelpTip>
      </label>
      {courseStyle === 'single-unit' && (
        <div>
          <input
            name="family_name"
            value={getFamilyNameValue()}
            type="hidden"
          />
          <label>
            What family is this course a part of?
            <select
              value={selectedFamilyName}
              style={styles.dropdown}
              className="familyNameSelector"
              onChange={e => setSelectedFamilyName(e.target.value)}
              disabled={newFamilyName !== ''}
            >
              <option value={''}>(None)</option>
              {props.families.map(familyOption => (
                <option key={familyOption} value={familyOption}>
                  {familyOption}
                </option>
              ))}
            </select>
            <span>
              or{' '}
              <input
                type="text"
                value={newFamilyName}
                style={styles.smallInput}
                onChange={e => setNewFamilyName(e.target.value)}
                disabled={selectedFamilyName !== ''}
              />
            </span>
            <HelpTip>
              <p>
                The family name is used to group together courses that are
                different version years of the same course so that users can be
                redirected between different version years. Family names should
                only contain letters, numbers, and dashes.
              </p>
            </HelpTip>
          </label>
          {(selectedFamilyName !== '' || newFamilyName !== '') && (
            <div>
              <label>
                Is this course going to get updated yearly?
                <select
                  style={styles.dropdown}
                  value={versionedCourse}
                  onChange={e => {
                    setVersionedCourse(e.target.value);
                    if (e.target.value === 'no') {
                      setVersionYear('unversioned');
                    } else {
                      // Make sure to clear version year if change this question
                      setVersionYear('');
                    }
                  }}
                >
                  <option key={'empty'} value={''}>
                    {''}
                  </option>
                  <option key={'yes'} value={'yes'}>
                    {'Yes'}
                  </option>
                  <option key={'no'} value={'no'}>
                    {'No'}
                  </option>
                </select>
                <HelpTip>
                  <p>
                    If you plan to make updates to this course and release a new
                    version in the future you should choose yes. Most things
                    about a course can not be edited once it is live.
                  </p>
                </HelpTip>
              </label>
              {versionedCourse !== '' && (
                <label>
                  What year is this course for?
                  <select
                    value={versionYear}
                    name="version_year"
                    style={styles.dropdown}
                    className="versionYearSelector"
                    disabled={versionedCourse === 'no'}
                    onChange={event => setVersionYear(event.target.value)}
                  >
                    <option value="">(None)</option>
                    {props.versionYearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {versionYear !== '' && (
                <label>
                  The Unit Slug for this course will be:
                  <HelpTip>
                    <p>
                      The unit slug is used to create the link to the unit. It
                      is in the format of studio.code.org/s/unit-slug-here. A
                      unit slug can only contain lowercase letters, numbers and
                      dashes. Once you set the slug it can not be updated.
                    </p>
                  </HelpTip>
                  <input
                    name="script[name]"
                    value={getScriptName()}
                    disabled={true}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      )}
      {courseStyle === 'multi-unit' && (
        <label>
          Unit Slug
          <HelpTip>
            <p>
              The unit slug is used to create the link to the unit. It is in the
              format of studio.code.org/s/unit-slug-here. A unit slug can only
              contain lowercase letters, numbers and dashes. Once you set the
              slug it can not be updated.
            </p>
          </HelpTip>
          <input name="script[name]" />
        </label>
      )}
      {(courseStyle === 'multi-unit' || versionYear) && (
        <div>
          <input name="is_migrated" value={true} type="hidden" />
          <input name="lesson_groups" value={'[]'} type="hidden" />
          <br />
          <button className="btn btn-primary" type="submit" style={buttonStyle}>
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}

NewUnitForm.propTypes = {
  families: PropTypes.arrayOf(PropTypes.string).isRequired,
  versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0
  },
  checkbox: {
    margin: '0 0 0 7px'
  },
  dropdown: {
    margin: '0 6px'
  },
  box: {
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid ' + color.light_gray,
    padding: 10
  }
};
