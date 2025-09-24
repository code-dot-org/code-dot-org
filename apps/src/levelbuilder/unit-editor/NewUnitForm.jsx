import React, {useState} from 'react';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

export default function NewUnitForm() {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const savingDetailsAndButton = React.useCallback(
    () => (
      <div className="savingDetailsAndButton">
        <input name="is_migrated" value={true} type="hidden" />
        <input name="lesson_groups" value={'[]'} type="hidden" />
        <br />
        <button
          className="btn btn-primary"
          style={styles.buttonStyle}
          onClick={() => setSubmitDialogOpen(true)}
          type="button"
        >
          Save Changes
        </button>
      </div>
    ),
    [setSubmitDialogOpen]
  );

  const submitDialog = React.useCallback(
    () => (
      <BaseDialog
        isOpen={submitDialogOpen}
        handleClose={() => setSubmitDialogOpen(false)}
      >
        <div className="submitDialog">
          <p>
            Are you sure you want to submit this unit? These fields are very
            difficult to change after submission.
            <br />
            It is recommended that you double check each field with another
            person if you are unsure.
          </p>
          <button
            className="btn btn-submit-dialog"
            type="submit"
            style={styles.buttonStyle}
          >
            Submit
          </button>
        </div>
      </BaseDialog>
    ),
    [submitDialogOpen, setSubmitDialogOpen]
  );

  return (
    <form action="/s" method="post">
      <RailsAuthenticityToken />
      <div>
        <label>
          Unit Slug
          <HelpTip>
            <p>
              The unit slug is used to create the link to the unit. It is in the
              format of studio.code.org/s/unit-slug-here. A unit slug can only
              contain lowercase letters, numbers and dashes. Once you set the
              slug it can not be updated.
            </p>
          </HelpTip>
          <input name="script[name]" />
        </label>
        {savingDetailsAndButton()}
      </div>
      {submitDialog()}
    </form>
  );
}

const styles = {
  dropdown: {
    margin: '0 6px',
  },
  buttonStyle: {
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 20,
  },
};
