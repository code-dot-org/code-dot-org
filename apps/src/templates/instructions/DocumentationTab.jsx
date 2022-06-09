import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {useFetch} from '@cdo/apps/util/useFetch';
import ProgrammingClassOverview from '../codeDocs/ProgrammingClassOverview';
import {TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const DEFAULT_CLASS_KEY = 'MainMethod';

export const UnconnectedDocumentationTab = function({
  programmingEnvironment,
  defaultClassKey = DEFAULT_CLASS_KEY
}) {
  const {loading, data, error} = useFetch(
    `/programming_environments/${programmingEnvironment}/get_summary_by_name`,
    null,
    [programmingEnvironment]
  );

  const [selectedClass, setSelectedClass] = useState(null);
  const [classMap, setClassMap] = useState({});
  const [fallbackKey, setFallbackKey] = useState(null);

  useEffect(() => {
    // parse the summary object, which is a list of categories each with a list of classes,
    // into a flat object of classes.
    const classes = {};
    let firstKey = null;
    if (data) {
      for (const category of data) {
        const categoryName = category.name;
        for (const classDoc of category.docs) {
          const friendlyName = `${categoryName} - ${classDoc.name}`;
          classes[classDoc.key] = {name: friendlyName, doc: classDoc};
          if (!firstKey) {
            firstKey = classDoc.key;
          }
        }
      }
    }
    if (classes[defaultClassKey]) {
      setFallbackKey(defaultClassKey);
    } else {
      setFallbackKey(firstKey);
    }
    setClassMap(classes);
  }, [data]);

  const getDropdownOptions = function() {
    const options = [];
    for (const key in classMap) {
      options.push(
        <option key={key} value={key}>
          {classMap[key].name}
        </option>
      );
    }
    return options;
  };

  const keyToShow = selectedClass || fallbackKey;

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

      {!loading && classMap && keyToShow && (
        <>
          <div style={styles.header}>
            <select
              value={keyToShow}
              onChange={e => setSelectedClass(e.target.value)}
              style={styles.select}
            >
              {getDropdownOptions()}
            </select>
            <div style={styles.docLink}>
              <TextLink
                href={`/docs/ide/${programmingEnvironment}/classes/${keyToShow}`}
                openInNewTab={true}
                icon={<FontAwesome icon="external-link" />}
              />
            </div>
          </div>
          <ProgrammingClassOverview
            programmingClass={classMap[keyToShow].doc}
            includeMethodSummary={true}
            isSmallWindow={true}
          />
        </>
      )}
    </div>
  );
};

UnconnectedDocumentationTab.propTypes = {
  programmingEnvironment: PropTypes.string.isRequired,
  defaultClassKey: PropTypes.string
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
