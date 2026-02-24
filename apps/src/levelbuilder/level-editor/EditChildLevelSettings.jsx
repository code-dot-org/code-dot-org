// This component will be used to edit the settings of any child levels
// The component will take in the following props:
// Child levels: an array of objects representing the child levels
import Link from '@code-dot-org/component-library/link';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import ChildLevelEditor from './ChildLevelEditor';

import styles from './edit-child-level-settings.module.scss';

//Create a boilerplate for the EditChildLevelSettings React component
const EditChildLevelSettings = ({initialChildLevelSettings}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const levelEditorUrl = childLevelId => `/levels/${childLevelId}/edit`;

  return (
    <>
      <div>
        <h3>This level has {initialChildLevelSettings.length} sublevels.</h3>
        {saveSuccess && (
          <div className={styles.successMessage}>Save successful!</div>
        )}
        <div>
          {initialChildLevelSettings.map((childLevel, index) => (
            <div className={styles.collapsibleFieldSection} key={index}>
              <hr />
              <CollapsibleSection headerContent={childLevel.name}>
                <div>
                  {childLevel.isDslDefined && (
                    <div className={styles.warningMessage}>
                      Note: This level is a DSL level. To make changes to the
                      title, description, or thumbnail, you must edit the DSL
                      level directly. You can do that at
                      <Link
                        text={'the level edit page'}
                        href={levelEditorUrl(childLevel.id)}
                        openInNewTab={true}
                        external={true}
                        size="s"
                      />
                    </div>
                  )}
                  {!childLevel.isDslDefined && (
                    <ChildLevelEditor
                      childLevel={childLevel}
                      index={index}
                      setSaveSuccess={setSaveSuccess}
                    />
                  )}
                </div>
              </CollapsibleSection>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

//Export the EditChildLevelSettings component
export default EditChildLevelSettings;

//Define the prop types for the EditChildLevelSettings component
EditChildLevelSettings.propTypes = {
  initialChildLevelSettings: PropTypes.array,
};
