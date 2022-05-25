import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {useFetch} from '@cdo/apps/util/useFetch';
import ProgrammingClassOverview from '../codeDocs/ProgrammingClassOverview';

const DEFAULT_CLASS = 'General - Basics';

const UnconnectedDocumentationTab = function({programmingEnvironment}) {
  const {loading, data, error} = useFetch(
    `/programming_environments/${programmingEnvironment}/get_summary_by_name`,
    null,
    [programmingEnvironment]
  );

  const [selectedClass, setSelectedClass] = useState(null);

  const classMap = {};
  let firstKey = null;
  if (data) {
    for (const category of data) {
      const categoryName = category.name;
      for (const classDoc of category.docs) {
        const key = `${categoryName} - ${classDoc.name}`;
        if (!firstKey) {
          firstKey = key;
        }
        classMap[key] = classDoc;
      }
    }
    console.log(classMap);

    if (!selectedClass) {
      if (classMap[DEFAULT_CLASS] && !selectedClass) {
        setSelectedClass(DEFAULT_CLASS);
      } else {
        setSelectedClass(firstKey);
      }
    }
  }

  return (
    <div>
      {loading && <Spinner />}
      {error && <p>Could not load documentation.</p>}
      {!loading && data && selectedClass && (
        <ProgrammingClassOverview programmingClass={classMap[selectedClass]} />
      )}
    </div>
  );
};

UnconnectedDocumentationTab.propTypes = {
  programmingEnvironment: PropTypes.string
};

export default connect(state => ({
  programmingEnvironment: state.instructions.programmingEnvironment
}))(UnconnectedDocumentationTab);
