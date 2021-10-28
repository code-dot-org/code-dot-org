import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import CodeReviewGroups from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroups';

export default function ManageCodeReviewGroups({buttonContainerStyle}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const onDialogClose = () => setIsDialogOpen(false);

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
        body={codeReviewGroups}
        isOpen={isDialogOpen}
        handleClose={onDialogClose}
      />
    </div>
  );
}

ManageCodeReviewGroups.propTypes = {buttonContainerStyle: PropTypes.object};

const names = [
  'Sanchit',
  'Mike',
  'Mark',
  'Molly',
  'Ben',
  'Jessie',
  'Jamila',
  'Hannah'
];

// Fake data generator.
// Returns an array of objects that can be used to render a group.
// Offset will creating objects starting at the offset indexed
// element in the names array above, rather than the first element (default).
const getMembers = (count, offset = 0) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    followerId: k + offset,
    name: names[k + offset]
  }));

// Create two groups of four people.
// We'll also eventually pass in a group name as a top level property.
const groups = [
  {id: 1, members: getMembers(4)},
  {id: 2, members: getMembers(4, 4)}
];

const codeReviewGroups = <CodeReviewGroups initialGroups={groups} />;

const styles = {
  buttonContainer: {
    marginLeft: 5
  }
};
