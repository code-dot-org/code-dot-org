import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import CodeReviewGroupsLoader from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsLoader';
import CodeReviewGroupsStatusToggle from '../codeReviewGroups/CodeReviewGroupsStatusToggle';

const DIALOG_WIDTH = 1000;

export default function ManageCodeReviewGroups({
  buttonContainerStyle,
  sectionId
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const onDialogClose = () => setIsDialogOpen(false);

  const renderFooter = buttons => {
    return (
      <>
        <CodeReviewGroupsStatusToggle />
        <div>{buttons}</div>
      </>
    );
  };

  return (
    <div style={{...styles.buttonContainer, ...buttonContainerStyle}}>
      {/* use div instead of button HTML element via __useDeprecatedTag
          for consistent spacing with other "buttons" in ManageStudentsTable header */}
      <Button
        __useDeprecatedTag
        onClick={openDialog}
        color={Button.ButtonColor.gray}
        text={i18n.manageCodeReviewGroups()}
        icon="comment"
      />
      <StylizedBaseDialog
        title={i18n.codeReviewGroups()}
        body={<CodeReviewGroupsLoader sectionId={sectionId} />}
        isOpen={isDialogOpen}
        handleClose={onDialogClose}
        fixedWidth={DIALOG_WIDTH}
        renderFooter={renderFooter}
        footerJustification="space-between"
      />
    </div>
  );
}

ManageCodeReviewGroups.propTypes = {
  sectionId: PropTypes.number.isRequired,
  buttonContainerStyle: PropTypes.object
};

const styles = {
  buttonContainer: {
    marginLeft: 5
  }
};
