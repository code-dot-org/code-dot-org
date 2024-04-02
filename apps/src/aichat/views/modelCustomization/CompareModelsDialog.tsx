import React from 'react';

import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import {
  StrongText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import moduleStyles from '@cdo/apps/aichat/views/chatWarningModal.module.scss';
import styles2 from './compare-models-dialog.module.scss';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
import Button from '@cdo/apps/componentLibrary/button/Button';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const CompareModelsDialog: React.FunctionComponent<{onClose: () => void}> = ({
  onClose,
}) => {
  return (
    <AccessibleDialog
      onClose={onClose}
      modalId={styles2.modelComparisonContainer}
    >
      <div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Heading3>Compare Models</Heading3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={moduleStyles.xCloseButton}
        >
          <i id="x-close" className="fa-solid fa-xmark" />
        </button>
      </div>
      <hr />
      <div style={{display: 'flex', position: 'relative', overflowY: 'auto'}}>
        <ModelDescriptionPanel />
        <ModelDescriptionPanel />
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <Button onClick={onClose} text="Finish" />
      </div>
    </AccessibleDialog>
  );
};

const ModelDescriptionPanel: React.FunctionComponent = () => {
  // update labeltext and name
  return (
    <div className={styles2.modelDescriptionContainer}>
      <SimpleDropdown
        labelText="Pick a model:"
        isLabelVisible={false}
        onChange={() => {}}
        items={[
          {value: 'llama2', text: 'LLama 2'},
          {value: 'gpt', text: 'ChatGPT'},
        ]}
        selectedValue={'llama2'}
        name="choose-model-1"
        size="s"
        className={styles.updateButton}
      />
      <StrongText>Overview</StrongText>
      <div className={styles2.descriptionContainer}>
        <BodyThreeText>{loremIpsum}</BodyThreeText>
      </div>
      <StrongText>Training Data</StrongText>
      <div className={styles2.descriptionContainer}>
        <BodyThreeText>{loremIpsum}</BodyThreeText>
      </div>
    </div>
  );
};

export default CompareModelsDialog;
