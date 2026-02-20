import {Button} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import AddResourceDialog from './AddResourceDialog';
import UrlTab from './UrlTab';

import styles from './lessonFeeedback.module.scss';

interface RecommendedActionsProps {
  resourceData: Array<{
    recommended_action: string;
    resource_name: string;
    resource_link: string;
  }>;
  setResourceData: React.Dispatch<
    React.SetStateAction<
      Array<{
        recommended_action: string;
        resource_name: string;
        resource_link: string;
      }>
    >
  >;
}

const RecommendedActions: React.FC<RecommendedActionsProps> = ({
  resourceData,
  setResourceData,
}) => {
  const [showAddResourcePopup, setShowAddResourcePopup] = React.useState(false);
  const [tempResourceName, setTempResourceName] = React.useState(
    resourceData[0]?.resource_name || ''
  );
  const [tempResourceLink, setTempResourceLink] = React.useState(
    resourceData[0]?.resource_link || ''
  );

  // Handler to open the Add Resource popup
  const handleAddResourceClick = () => {
    setShowAddResourcePopup(true);
  };

  // Handler to close the Add Resource popup
  const handleCloseResourcePopup = () => {
    setShowAddResourcePopup(false);
    setTempResourceName(resourceData[0]?.resource_name || '');
    setTempResourceLink('');
  };

  // Handler to save the new resource link
  const handleResourceSave = () => {
    if (tempResourceName && tempResourceLink) {
      const newResource = {
        recommended_action: resourceData[0]?.recommended_action || '',
        resource_name: tempResourceName,
        resource_link: tempResourceLink,
      };
      setResourceData([newResource]);
      analyticsReporter.sendEvent(
        EVENTS.LESSON_SNAPSHOT_RESOURCE_LINK_ADDED,
        {},
        PLATFORMS.STATSIG
      );
      handleCloseResourcePopup();
    }
  };
  // Handler to update recommended_action for resourceData[0]
  const handleRecommendedActionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setResourceData(prev => {
      const updated = [...prev];
      if (updated.length === 0) {
        updated.push({
          recommended_action: newValue,
          resource_name: '',
          resource_link: '',
        });
      } else {
        updated[0] = {...updated[0], recommended_action: newValue};
      }
      return updated;
    });
  };

  const handleTempResourceNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTempResourceName(e.target.value);
  };

  const handleTempResourceLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTempResourceLink(e.target.value);
  };

  const deleteResourceLink = () => {
    setResourceData(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0] = {
          ...updated[0],
          resource_name: '',
          resource_link: '',
        };
      }
      return updated;
    });
  };

  // TO DO: Figure out what fields are required and adjust UI accordingly.
  return (
    <div className={styles.recommendedActionContainer}>
      <label className={styles.typographyLabelTwo}>
        {i18n.lessonFeedbackRecommendedAction()}
      </label>
      <Typography variant="body4">
        {i18n.lessonFeedbackRecommendedActionDirections()}
      </Typography>
      <div className={styles.inputWrapper}>
        <input
          className={styles.inputBox}
          type="text"
          placeholder={'Write a message'}
          value={resourceData[0]?.recommended_action || ''}
          onChange={handleRecommendedActionInputChange}
        />
        <div className={styles.resourceRow}>
          <Button
            text={'Add resource link'}
            size="xs"
            type="secondary"
            color="gray"
            disabled={!!resourceData[0]?.resource_name}
            iconLeft={{
              iconStyle: 'solid',
              iconName: 'plus',
              title: 'Add Resource',
            }}
            onClick={handleAddResourceClick}
          />
          {resourceData[0]?.resource_name && resourceData[0]?.resource_link && (
            <UrlTab
              urlName={resourceData[0]?.resource_name}
              onClickHandler={deleteResourceLink}
            />
          )}
        </div>
      </div>
      {showAddResourcePopup && (
        <AddResourceDialog
          tempResourceName={tempResourceName}
          tempResourceLink={tempResourceLink}
          onResourceNameChange={handleTempResourceNameChange}
          onResourceLinkChange={handleTempResourceLinkChange}
          onCancel={() => setShowAddResourcePopup(false)}
          onSave={handleResourceSave}
          onClose={() => setShowAddResourcePopup(false)}
        />
      )}
    </div>
  );
};

export default RecommendedActions;
