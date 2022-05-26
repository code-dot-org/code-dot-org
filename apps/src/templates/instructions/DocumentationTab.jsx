import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {useFetch} from '@cdo/apps/util/useFetch';
import ProgrammingClassOverview from '../codeDocs/ProgrammingClassOverview';
import {TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const DEFAULT_CLASS = 'Java Basics - The main Method';

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

    if (!selectedClass) {
      if (classMap[DEFAULT_CLASS] && !selectedClass) {
        setSelectedClass(DEFAULT_CLASS);
      } else {
        setSelectedClass(firstKey);
      }
    }
  }

  const getDropdownOptions = function() {
    const options = [];
    for (const key in classMap) {
      options.push(
        <option key={key} value={key}>
          {key}
        </option>
      );
    }
    return options;
  };

  return (
    <div>
      {loading && (
        <div style={styles.loadingInformation}>
          <Spinner style={styles.spinner} />
        </div>
      )}
      {error && (
        <p style={styles.loadingInformation}>
          {i18n.errorLoadingDocumentation()}
        </p>
      )}

      {!loading && data && (
        <>
          <div style={styles.header}>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={styles.select}
            >
              {getDropdownOptions()}
            </select>
            {selectedClass && (
              <div style={styles.docLink}>
                <TextLink
                  href={`/docs/ide/${programmingEnvironment}/classes/${
                    classMap[selectedClass].key
                  }`}
                  openInNewTab={true}
                  icon={<FontAwesome icon="external-link" />}
                />
              </div>
            )}
          </div>
          {selectedClass && (
            <ProgrammingClassOverview
              programmingClass={classMap[selectedClass]}
              includeMethodSummary={true}
            />
          )}
        </>
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

const styles = {
  select: {
    width: 275,
    marginTop: 5
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  loadingInformation: {
    display: 'flex',
    margin: '25px',
    justifyContent: 'center'
  },
  docLink: {
    marginRight: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};
