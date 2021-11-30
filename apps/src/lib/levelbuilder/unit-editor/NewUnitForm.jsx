import React, {useState} from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import PropTypes from 'prop-types';
import NewCourseFields from '../NewCourseFields';

export default function NewUnitForm(props) {
  const [courseStyle, setCourseStyle] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [versionYear, setVersionYear] = useState('');

  const getScriptName = () => {
    const name =
      versionYear !== 'unversioned'
        ? familyName + '-' + versionYear
        : familyName;
    return name;
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
          <NewCourseFields
            families={props.families}
            versionYearOptions={props.versionYearOptions}
            familyName={familyName}
            setFamilyName={setFamilyName}
            versionYear={versionYear}
            setVersionYear={setVersionYear}
          />
          {familyName !== '' && versionYear !== '' && (
            <div>
              <label>
                The Unit Slug for this course will be:
                <HelpTip>
                  <p>
                    The unit slug is used to create the link to the unit. It is
                    in the format of studio.code.org/s/unit-slug-here. A unit
                    slug can only contain lowercase letters, numbers and dashes.
                    Once you set the slug it can not be updated.
                  </p>
                </HelpTip>
                <input
                  name="script[name]"
                  value={getScriptName()}
                  disabled={true}
                />
              </label>
              <div>
                <input name="is_migrated" value={true} type="hidden" />
                <input name="lesson_groups" value={'[]'} type="hidden" />
                <br />
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={styles.buttonStyle}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {courseStyle === 'multi-unit' && (
        <div>
          <label>
            Unit Slug
            <HelpTip>
              <p>
                The unit slug is used to create the link to the unit. It is in
                the format of studio.code.org/s/unit-slug-here. A unit slug can
                only contain lowercase letters, numbers and dashes. Once you set
                the slug it can not be updated.
              </p>
            </HelpTip>
            <input name="script[name]" />
          </label>
          <div>
            <input name="is_migrated" value={true} type="hidden" />
            <input name="lesson_groups" value={'[]'} type="hidden" />
            <br />
            <button
              className="btn btn-primary"
              type="submit"
              style={styles.buttonStyle}
            >
              Save Changes
            </button>
          </div>
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
  dropdown: {
    margin: '0 6px'
  },
  buttonStyle: {
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 20
  }
};
