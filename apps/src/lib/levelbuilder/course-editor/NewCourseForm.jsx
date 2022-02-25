import React, {useState} from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import PropTypes from 'prop-types';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import NewCourseFields from '../NewCourseFields';

export default function NewCourseForm(props) {
  const [familyName, setFamilyName] = useState('');
  const [versionYear, setVersionYear] = useState('');

  const getCourseName = () => {
    const name =
      versionYear !== 'unversioned'
        ? familyName + '-' + versionYear
        : familyName;
    return name;
  };

  return (
    <form action="/courses" method="post">
      <RailsAuthenticityToken />
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
            The Course Slug for this course will be:
            <HelpTip>
              <p>
                The course slug is used to create the link to the course. It is
                in the format of studio.code.org/courses/course-slug-here. A
                course slug can only contain lowercase letters, numbers and
                dashes. Once you set the slug it can not be updated.
              </p>
            </HelpTip>
            {/* Need both of these inputs because if the hidden one with name=
                  is also disabled it will not save properly*/}
            <input value={getCourseName()} disabled={true} />
            <input name="course[name]" value={getCourseName()} type="hidden" />
          </label>
          <input name="family_name" value={familyName} type="hidden" />
          <input name="version_year" value={versionYear} type="hidden" />
          <br />
          <button
            className="btn btn-primary"
            type="submit"
            style={styles.buttonStyle}
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}

NewCourseForm.propTypes = {
  families: PropTypes.arrayOf(PropTypes.string).isRequired,
  versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};

const styles = {
  buttonStyle: {
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 20
  }
};
